import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventsGateway } from '../events/events.gateway';
import { WellnessService } from '../pomodoro/wellness.service';
import { AiMentorService } from '../ai-mentor/ai-mentor.service';
import { GotchiService } from '../gotchi/gotchi.service';
import { LanguageDetectorService } from './language-detector.service';
// ActionType enum removed for SQLite compatibility. Using string literals.

// ---- XP Calculation ----

const XP_PER_COMMIT = 10;
const COINS_PER_COMMIT = 5;
const MOOD_BOOST_PER_COMMIT = 10;
const XP_CI_SUCCESS = 15;
const MOOD_BOOST_CI_SUCCESS = 15;
const ENERGY_PENALTY_CI_FAILURE = 10;

/** level = floor(0.1 * sqrt(totalXP)) + 1 */
export function calculateLevel(totalXP: number): number {
  return Math.floor(0.1 * Math.sqrt(totalXP)) + 1;
}

/** Clamp val between min and max */
function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

// ---- Payload interfaces ----

interface GitHubCommit {
  id: string;
  message: string;
  author: { name: string; email: string };
  timestamp: string;
  added?: string[];
  removed?: string[];
  modified?: string[];
}

interface GitHubPushPayload {
  ref: string;
  repository: { id: number; full_name: string };
  pusher: { name: string; email: string };
  commits: GitHubCommit[];
  sender: { login: string; id: number };
}

interface GitHubWorkflowRunPayload {
  action: string;
  workflow_run: {
    id: number;
    name: string;
    conclusion: 'success' | 'failure' | 'cancelled' | 'skipped' | null;
    status: string;
  };
  repository: { id: number; full_name: string };
  sender: { login: string; id: number };
}

@Injectable()
export class GithubService {
  private readonly logger = new Logger(GithubService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventsGateway: EventsGateway,
    private readonly wellnessService: WellnessService,
    private readonly aiMentorService: AiMentorService,
    private readonly gotchiService: GotchiService,
    private readonly languageDetector: LanguageDetectorService,
  ) {}

  // ---------------------------------------------------------------
  // Handle push event
  // ---------------------------------------------------------------
  async handlePushEvent(payload: GitHubPushPayload): Promise<void> {
    const githubUsername = payload.sender.login;
    const commitCount = payload.commits.length;

    if (commitCount === 0) return;

    const user = await this.prisma.user.findUnique({
      where: { username: githubUsername },
      include: { gotchi: true },
    });

    if (!user) {
      this.logger.warn(`No user found for GitHub username: ${githubUsername}`);
      return;
    }

    // ---- DETECT PROGRAMMING LANGUAGE FROM COMMIT FILES ----
    const allFiles: string[] = [];
    for (const commit of payload.commits) {
      if (commit.added) allFiles.push(...commit.added);
      if (commit.modified) allFiles.push(...commit.modified);
      if (commit.removed) allFiles.push(...commit.removed);
    }

    const detectedLanguage = this.languageDetector.detectLanguage(allFiles);
    const newTheme = this.languageDetector.mapLanguageToTheme(detectedLanguage);

    // Update Gotchi theme if language detected and different from current
    if (user.gotchi && detectedLanguage !== 'Unknown' && user.gotchi.theme !== newTheme) {
      await this.gotchiService.updateGotchi(user.id, { theme: newTheme });
      this.logger.log(`Updated Gotchi theme to ${newTheme} for user ${githubUsername}`);

      // Emit theme change event to frontend
      await this.eventsGateway.emitToUser(user.id, 'theme_changed', {
        newTheme,
        language: detectedLanguage,
        message: `🎨 Your Gotchi transformed into ${detectedLanguage} mode!`,
      });
    }

    // Wellness check — is this user overworking?
    const { isOverworking, shouldBlockXP } =
      await this.wellnessService.checkOverwork(user.id);

    if (isOverworking) {
      await this.eventsGateway.emitToUser(user.id, 'force_sleep', {
        message: '💤 You need rest! XP blocked for 6 hours.',
        reason: shouldBlockXP ? 'night_hours' : 'streak_overload',
      });
    }

    // XP gain (skip if blocked)
    const xpGain = shouldBlockXP ? 0 : XP_PER_COMMIT * commitCount;
    const coinsGain = COINS_PER_COMMIT * commitCount;
    const newTotalXP = user.totalXP + xpGain;
    const newLevel = calculateLevel(newTotalXP);
    const didLevelUp = newLevel > user.level;

    // Update user
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        totalXP: { increment: xpGain },
        commitCoins: { increment: coinsGain },
        level: newLevel,
        currentStreak: { increment: 1 },
        lastCommitDate: new Date(),
        xpBlockedUntil: shouldBlockXP
          ? new Date(Date.now() + 6 * 60 * 60 * 1000) // +6h
          : undefined,
      },
    });

    // Update gotchi mood
    if (user.gotchi) {
      const newMood = clamp(user.gotchi.mood + MOOD_BOOST_PER_COMMIT, 0, 100);
      await this.prisma.gotchi.update({
        where: { id: user.gotchi.id },
        data: { mood: newMood },
      });
    }

    // Log activity for each commit
    await this.prisma.activityLog.createMany({
      data: payload.commits.map((commit) => ({
        userId: user.id,
        actionType: 'COMMIT',
        xpGained: Math.floor(xpGain / commitCount),
        coinsGained: COINS_PER_COMMIT,
        metadata: JSON.stringify({
          commitId: commit.id,
          message: commit.message,
          repo: payload.repository.full_name,
          ref: payload.ref,
          language: detectedLanguage,
        }),
      })),
    });

    // AI feedback on latest commit message
    const latestCommit = payload.commits[payload.commits.length - 1];
    const aiFeedback = await this.aiMentorService.reviewCommitMessage(
      latestCommit?.message ?? '',
      githubUsername,
    );

    // Emit real-time update to the user's socket room
    await this.eventsGateway.emitToUser(user.id, 'xp_update', {
      xpGained: xpGain,
      coinsGained: coinsGain,
      newTotalXP,
      newLevel,
      didLevelUp,
      aiFeedback,
      commitCount,
      repo: payload.repository.full_name,
    });

    if (didLevelUp) {
      await this.eventsGateway.emitToUser(user.id, 'level_up', {
        newLevel,
        message: `🎉 Level up! You're now Level ${newLevel}!`,
      });
    }

    this.logger.log(
      `Push processed for ${githubUsername}: +${xpGain} XP, +${coinsGain} coins, ${commitCount} commits, language: ${detectedLanguage}`,
    );
  }

  // ---------------------------------------------------------------
  // Handle workflow_run event
  // ---------------------------------------------------------------
  async handleWorkflowRunEvent(payload: GitHubWorkflowRunPayload): Promise<void> {
    if (payload.action !== 'completed') return;

    const githubUsername = payload.sender.login;
    const { conclusion } = payload.workflow_run;

    const user = await this.prisma.user.findUnique({
      where: { username: githubUsername },
      include: { gotchi: true },
    });

    if (!user) return;

    if (conclusion === 'success') {
      // Grant XP for successful CI
      const newTotalXP = user.totalXP + XP_CI_SUCCESS;
      const newLevel = calculateLevel(newTotalXP);

      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          totalXP: { increment: XP_CI_SUCCESS },
          level: newLevel,
        },
      });

      if (user.gotchi) {
        const newMood = clamp(
          user.gotchi.mood + MOOD_BOOST_CI_SUCCESS,
          0,
          100,
        );
        await this.prisma.gotchi.update({
          where: { id: user.gotchi.id },
          data: { mood: newMood },
        });
      }

      await this.prisma.activityLog.create({
        data: {
          userId: user.id,
          actionType: 'BUILD_SUCCESS',
          xpGained: XP_CI_SUCCESS,
          coinsGained: 0,
          metadata: JSON.stringify({
            workflowName: payload.workflow_run.name,
            repo: payload.repository.full_name,
          }),
        },
      });

      await this.eventsGateway.emitToUser(user.id, 'ci_success', {
        workflowName: payload.workflow_run.name,
        repo: payload.repository.full_name,
        xpGained: XP_CI_SUCCESS,
        message: '✅ CI passed! Great work!',
      });
    } else if (conclusion === 'failure') {
      // Penalize Gotchi energy
      if (user.gotchi) {
        const newEnergy = clamp(
          user.gotchi.energy - ENERGY_PENALTY_CI_FAILURE,
          0,
          100,
        );
        await this.prisma.gotchi.update({
          where: { id: user.gotchi.id },
          data: { energy: newEnergy },
        });
      }

      await this.prisma.activityLog.create({
        data: {
          userId: user.id,
          actionType: 'BUILD_FAILED',
          xpGained: 0,
          coinsGained: 0,
          metadata: JSON.stringify({
            workflowName: payload.workflow_run.name,
            repo: payload.repository.full_name,
          }),
        },
      });

      await this.eventsGateway.emitToUser(user.id, 'ci_failure', {
        workflowName: payload.workflow_run.name,
        repo: payload.repository.full_name,
        message: '❌ CI failed! Fix those tests! You can do it! 💪',
      });
    }

    this.logger.log(
      `Workflow run ${payload.workflow_run.name} completed: ${conclusion} for ${githubUsername}`,
    );
  }
}
