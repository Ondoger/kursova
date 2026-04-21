import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
// ActionType import removed for SQLite compatibility. Using string literals.
import type { JwtPayload } from '../auth/jwt.strategy';

// ---- Client Event Payloads ----

interface JoinGuildPayload {
  guildId: string;
}

interface GuildMessagePayload {
  guildId: string;
  message: string;
}

interface JoinPomodoroPayload {
  duration: number; // minutes, e.g. 25
}

interface FocusLostPayload {
  tabHiddenMs: number;
}

// ---- Server → Client event map ----

interface ServerEvents {
  xp_update: (data: any) => void;
  level_up: (data: any) => void;
  ci_success: (data: any) => void;
  ci_failure: (data: any) => void;
  force_sleep: (data: any) => void;
  timer_tick: (data: any) => void;
  pomodoro_complete: (data: any) => void;
  guild_message: (data: any) => void;
  guild_member_joined: (data: any) => void;
  guild_member_left: (data: any) => void;
  focus_lost_ack: (data: any) => void;
  theme_changed: (data: any) => void;
  error: (data: { message: string }) => void;
}

/** Authenticated socket — carries userId after handshake */
interface AuthenticatedSocket extends Socket {
  data: {
    userId: string;
    username: string;
    guildId?: string;
  };
}

@Injectable()
@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/',
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  private readonly server!: Server<ServerEvents>;

  private readonly logger = new Logger(EventsGateway.name);

  /** userId → active pomodoro interval */
  private readonly pomodoroTimers = new Map<
    string,
    { intervalId: NodeJS.Timeout; endsAt: Date }
  >();

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  // ---------------------------------------------------------------
  // Connection lifecycle
  // ---------------------------------------------------------------

  async handleConnection(client: AuthenticatedSocket): Promise<void> {
    try {
      const token = this.extractToken(client);
      const payload = this.jwtService.verify<JwtPayload>(token);

      client.data.userId = payload.sub;
      client.data.username = payload.username;

      // Join personal room
      void client.join(`user_${payload.sub}`);
      this.logger.log(`Client connected: ${payload.username} (${client.id})`);

      // Auto-join guild room if user belongs to one
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: { guildId: true },
      });

      if (user?.guildId) {
        client.data.guildId = user.guildId;
        void client.join(`guild_${user.guildId}`);
      }
    } catch {
      this.logger.warn(`Rejected unauthenticated connection: ${client.id}`);
      client.disconnect(true);
    }
  }

  handleDisconnect(client: AuthenticatedSocket): void {
    const { userId, username, guildId } = client.data;
    this.logger.log(`Client disconnected: ${username ?? 'unknown'}`);

    // Clean up pomodoro timer if active
    if (userId && this.pomodoroTimers.has(userId)) {
      const timer = this.pomodoroTimers.get(userId)!;
      clearInterval(timer.intervalId);
      this.pomodoroTimers.delete(userId);
    }

    // Notify guild
    if (userId && guildId) {
      this.server.to(`guild_${guildId}`).emit('guild_member_left', {
        username,
        userId,
      });
    }
  }

  // ---------------------------------------------------------------
  // Guild events
  // ---------------------------------------------------------------

  @SubscribeMessage('join_guild')
  async handleJoinGuild(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: JoinGuildPayload,
  ): Promise<void> {
    const { userId, username } = client.data;
    const { guildId } = payload;

    const guild = await this.prisma.guild.findUnique({
      where: { id: guildId },
    });

    if (!guild) {
      throw new WsException(`Guild ${guildId} not found.`);
    }

    // Update DB
    await this.prisma.user.update({
      where: { id: userId },
      data: { guildId },
    });

    client.data.guildId = guildId;
    void client.join(`guild_${guildId}`);

    this.server.to(`guild_${guildId}`).emit('guild_member_joined', {
      username,
      userId,
      guildName: guild.name,
    });

    this.logger.log(`${username} joined guild ${guild.name}`);
  }

  @SubscribeMessage('guild_message')
  handleGuildMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: GuildMessagePayload,
  ): void {
    const { userId, username, guildId } = client.data;

    if (!guildId || guildId !== payload.guildId) {
      throw new WsException('You are not in this guild.');
    }

    const sanitizedMessage = payload.message.trim().slice(0, 500);
    if (!sanitizedMessage) return;

    this.server.to(`guild_${guildId}`).emit('guild_message', {
      userId,
      username,
      message: sanitizedMessage,
      timestamp: new Date().toISOString(),
    });
  }

  // ---------------------------------------------------------------
  // Pomodoro events
  // ---------------------------------------------------------------

  @SubscribeMessage('start_pomodoro')
  handleStartPomodoro(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: JoinPomodoroPayload,
  ): void {
    const { userId } = client.data;

    // Cancel any existing timer
    if (this.pomodoroTimers.has(userId)) {
      clearInterval(this.pomodoroTimers.get(userId)!.intervalId);
    }

    const durationMs = (payload.duration || 25) * 60 * 1000;
    const endsAt = new Date(Date.now() + durationMs);

    void client.join(`pomodoro_room_${userId}`);

    let remaining = durationMs;

    const intervalId = setInterval(() => {
      remaining -= 1000;

      this.server.to(`pomodoro_room_${userId}`).emit('timer_tick', {
        remaining,
        total: durationMs,
        percent: Math.round(((durationMs - remaining) / durationMs) * 100),
      });

      if (remaining <= 0) {
        clearInterval(intervalId);
        this.pomodoroTimers.delete(userId);
        this.handlePomodoroComplete(userId);
      }
    }, 1000);

    this.pomodoroTimers.set(userId, { intervalId, endsAt });
    this.logger.log(`Pomodoro started for ${userId} — ${payload.duration} min`);
  }

  @SubscribeMessage('stop_pomodoro')
  handleStopPomodoro(@ConnectedSocket() client: AuthenticatedSocket): void {
    const { userId } = client.data;
    if (this.pomodoroTimers.has(userId)) {
      clearInterval(this.pomodoroTimers.get(userId)!.intervalId);
      this.pomodoroTimers.delete(userId);
    }
  }

  @SubscribeMessage('focus_lost')
  async handleFocusLost(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: FocusLostPayload,
  ): Promise<void> {
    const { userId, username } = client.data;

    this.logger.warn(`Focus lost for ${username} — tab hidden ${payload.tabHiddenMs}ms`);

    // Deduct Gotchi energy proportionally to time away
    const energyPenalty = Math.min(
      15,
      Math.floor(payload.tabHiddenMs / 60000) + 5,
    );

    await this.prisma.gotchi.updateMany({
      where: { userId },
      data: {
        energy: { decrement: energyPenalty },
      },
    });

    // Clamp energy to 0
    // No raw SQL needed for simple energy reduction if we fetch and update, 
    // or we'll just skip the clamp for now to keep it simple, or use direct SQL.
    // SQLite doesn't support GREATEST() directly as Postgres does.
    // We'll use a safer approach: update and then clamp if needed, or use CASE.
    await this.prisma.$executeRawUnsafe(
      `UPDATE gotchis SET energy = CASE WHEN energy < 0 THEN 0 ELSE energy END WHERE userId = ?`,
      userId,
    );

    await this.prisma.activityLog.create({
      data: {
        userId,
        actionType: 'FOCUS_LOST',
        xpGained: 0,
        coinsGained: 0,
        metadata: JSON.stringify({ tabHiddenMs: payload.tabHiddenMs, energyPenalty }),
      },
    });

    this.server.to(`pomodoro_room_${userId}`).emit('focus_lost_ack', {
      energyDeducted: energyPenalty,
      message: '😴 Your Gotchi noticed you left! Focus up!',
    });
  }

  // ---------------------------------------------------------------
  // Public methods — called by other services
  // ---------------------------------------------------------------

  async emitToUser(userId: string, event: keyof ServerEvents, data: any): Promise<void> {
    this.server.to(`user_${userId}`).emit(event as any, data);
  }

  emitToGuild(guildId: string, event: keyof ServerEvents, data: any): void {
    this.server.to(`guild_${guildId}`).emit(event as any, data);
  }

  // ---------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------

  private extractToken(client: Socket): string {
    // Try cookie
    const cookieHeader = client.handshake.headers.cookie ?? '';
    const cookieMatch = /access_token=([^;]+)/.exec(cookieHeader);
    if (cookieMatch?.[1]) return cookieMatch[1];

    // Try auth header
    const authHeader = client.handshake.auth as { token?: string };
    if (authHeader.token) return authHeader.token;

    throw new WsException('No authentication token provided.');
  }

  private handlePomodoroComplete(userId: string): void {
    void (async () => {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          totalXP: { increment: 20 },
        },
      });

      await this.prisma.gotchi.updateMany({
        where: { userId },
        data: { energy: { increment: 10 }, mood: { increment: 5 } },
      });

      // Clamp values
      await this.prisma.$executeRawUnsafe(
        `UPDATE gotchis SET energy = CASE WHEN energy > 100 THEN 100 ELSE energy END, mood = CASE WHEN mood > 100 THEN 100 ELSE mood END WHERE userId = ?`,
        userId,
      );

      await this.prisma.activityLog.create({
        data: {
          userId,
          actionType: 'POMODORO_COMPLETED',
          xpGained: 20,
          coinsGained: 10,
        },
      });

      this.server.to(`pomodoro_room_${userId}`).emit('pomodoro_complete', {
        xpGained: 20,
        coinsGained: 10,
        message: '🍅 Pomodoro complete! Take a break, you earned it! 🌸',
      });

      this.logger.log(`Pomodoro completed for ${userId}`);
    })();
  }
}
