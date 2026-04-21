import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { AiMentorService } from '../ai-mentor/ai-mentor.service';
import type { User } from '@prisma/client';
import type { JwtPayload } from './jwt.strategy';

export interface GitHubProfile {
  githubId: string;
  username: string;
  email: string;
  avatarUrl: string | null;
}

export interface LoginResponse {
  user: Omit<User, 'xpBlockedUntil'>;
  accessToken: string;
  morningMessage?: string;
}

/** XP to level formula: level = floor(0.1 * sqrt(totalXP)) + 1 */
export function calculateLevel(totalXP: number): number {
  return Math.floor(0.1 * Math.sqrt(totalXP)) + 1;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly aiMentorService: AiMentorService,
  ) {}

  async findOrCreateUser(profile: GitHubProfile): Promise<User> {
    const existing = await this.prisma.user.findUnique({
      where: { githubId: profile.githubId },
    });

    if (existing) return existing;

    // New user — create user + gotchi
    const user = await this.prisma.user.create({
      data: {
        githubId: profile.githubId,
        username: profile.username,
        email: profile.email,
        avatarUrl: profile.avatarUrl,
        gotchi: {
          create: {
            name: `${profile.username}'s Gotchi`,
            theme: 'TypeScript',
            mood: 80,
            energy: 100,
          },
        },
      },
    });

    return user;
  }

  async login(user: User): Promise<LoginResponse> {
    const payload: JwtPayload = { sub: user.id, username: user.username };
    const accessToken = this.jwtService.sign(payload);

    // Check if this is the first login today (morning stand-up)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayLogin = await this.prisma.activityLog.findFirst({
      where: {
        userId: user.id,
        actionType: 'DAILY_LOGIN',
        createdAt: { gte: today },
      },
    });

    let morningMessage: string | undefined;

    if (!todayLogin) {
      // Log the daily login
      await this.prisma.activityLog.create({
        data: {
          userId: user.id,
          actionType: 'DAILY_LOGIN',
          xpGained: 5,
          coinsGained: 0,
          metadata: JSON.stringify({ loginTime: new Date().toISOString() }),
        },
      });

      // Award daily login XP
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          totalXP: { increment: 5 },
          level: calculateLevel(user.totalXP + 5),
        },
      });

      // Fetch recent activity for morning stand-up
      const recentLogs = await this.prisma.activityLog.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 5,
      });

      morningMessage = await this.aiMentorService.generateMorningStandup(
        user.username,
        recentLogs,
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { xpBlockedUntil: _blocked, ...safeUser } = user;

    return { user: safeUser, accessToken, morningMessage };
  }

  async getProfile(userId: string): Promise<User & { gotchi: object | null }> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      include: { gotchi: true, guild: true },
    });
    return user as User & { gotchi: object | null };
  }
}
