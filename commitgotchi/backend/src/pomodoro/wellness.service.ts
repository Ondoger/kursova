import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { AiMentorService } from '../ai-mentor/ai-mentor.service';

/** Result of the overwork check for a given user */
export interface OverworkCheckResult {
  isOverworking: boolean;
  shouldBlockXP: boolean;
  reason: 'night_hours' | 'streak_overload' | 'none';
}

@Injectable()
export class WellnessService {
  private readonly logger = new Logger(WellnessService.name);

  /** Users whose XP is currently blocked: userId → unblockTime */
  private readonly xpBlockedUsers = new Map<string, Date>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiMentorService: AiMentorService,
  ) {}

  /**
   * Check if a user is overworking.
   * Conditions:
   * 1. Current time is between 02:00 and 05:00 local time
   * 2. User has logged activity for 14+ consecutive days without a break
   */
  async checkOverwork(userId: string): Promise<OverworkCheckResult> {
    const now = new Date();
    const hour = now.getHours();

    // Condition 1: Night-time coding (02:00–05:00)
    if (hour >= 2 && hour < 5) {
      const alreadyBlocked = await this.isXpBlocked(userId);
      await this.applyXpBlock(userId, 6);

      return {
        isOverworking: true,
        shouldBlockXP: !alreadyBlocked,
        reason: 'night_hours',
      };
    }

    // Condition 2: 14-day consecutive streak
    const streak = await this.getConsecutiveStreak(userId);
    if (streak >= 14) {
      const alreadyBlocked = await this.isXpBlocked(userId);
      await this.applyXpBlock(userId, 6);

      return {
        isOverworking: true,
        shouldBlockXP: !alreadyBlocked,
        reason: 'streak_overload',
      };
    }

    // No overwork detected
    return { isOverworking: false, shouldBlockXP: false, reason: 'none' };
  }

  /**
   * Check if user's XP is currently blocked.
   */
  async isXpBlocked(userId: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { xpBlockedUntil: true },
    });

    if (!user?.xpBlockedUntil) return false;
    return new Date() < user.xpBlockedUntil;
  }

  /**
   * Apply XP block for N hours in the database.
   */
  async applyXpBlock(userId: string, hours: number): Promise<void> {
    const blockedUntil = new Date(Date.now() + hours * 60 * 60 * 1000);
    await this.prisma.user.update({
      where: { id: userId },
      data: { xpBlockedUntil: blockedUntil },
    });
    this.xpBlockedUsers.set(userId, blockedUntil);
  }

  /**
   * Calculate current consecutive day streak based on activity logs.
   */
  async getConsecutiveStreak(userId: string): Promise<number> {
    const logs = await this.prisma.activityLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true },
    });

    if (logs.length === 0) return 0;

    // Build a set of unique activity dates (YYYY-MM-DD)
    const activeDays = new Set<string>(
      logs.map((l) => l.createdAt.toISOString().split('T')[0]!),
    );

    let streak = 0;
    const today = new Date();

    for (let i = 0; i < 60; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = d.toISOString().split('T')[0]!;

      if (activeDays.has(key)) {
        streak++;
      } else {
        // Allow today to not have activity yet
        if (i !== 0) break;
      }
    }

    return streak;
  }

  /**
   * Nightly cron job — reset streak for users who missed a day.
   * Runs daily at 00:05 AM.
   */
  @Cron('5 0 * * *')
  async handleNightlyStreakReset(): Promise<void> {
    this.logger.log('Running nightly streak reset check...');

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const usersWithOldStreak = await this.prisma.user.findMany({
      where: {
        currentStreak: { gt: 0 },
        lastCommitDate: { lt: yesterday },
      },
      select: { id: true, currentStreak: true },
    });

    if (usersWithOldStreak.length > 0) {
      await this.prisma.user.updateMany({
        where: {
          id: { in: usersWithOldStreak.map((u) => u.id) },
        },
        data: { currentStreak: 0 },
      });

      this.logger.log(
        `Streak reset for ${usersWithOldStreak.length} inactive users.`,
      );
    }
  }

  /**
   * Hourly cron — unblock XP for users who have served their 6-hour block.
   */
  @Cron(CronExpression.EVERY_HOUR)
  async handleXpUnblock(): Promise<void> {
    const now = new Date();

    await this.prisma.user.updateMany({
      where: {
        xpBlockedUntil: { not: null, lte: now },
      },
      data: { xpBlockedUntil: null },
    });
  }
}
