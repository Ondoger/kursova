import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import type { ActivityLog } from '@prisma/client';

@Injectable()
export class AiMentorService {
  private readonly logger = new Logger(AiMentorService.name);
  private readonly openai: OpenAI;
  private readonly model: string;

  constructor(private readonly configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: configService.getOrThrow<string>('OPENAI_API_KEY'),
    });
    this.model = configService.get<string>('OPENAI_MODEL', 'gpt-4o-mini');
  }

  /**
   * Review a single commit message and return a cute 1-sentence encouragement.
   * Called after each push webhook.
   */
  async reviewCommitMessage(
    commitMessage: string,
    username: string,
  ): Promise<string> {
    if (!commitMessage.trim()) {
      return `${username}, every commit counts — keep exploring! 🌟`;
    }

    try {
      const response = await this.openai.chat.completions.create({
        model: this.model,
        max_tokens: 80,
        temperature: 0.8,
        messages: [
          {
            role: 'system',
            content:
              'You are a wholesome, supportive virtual assistant for a programmer. ' +
              'Review the following commit message and give a 1-sentence cute, ' +
              'encouraging feedback. Be brief (max 20 words), warm, and uplifting. ' +
              'Do NOT be sarcastic. Address the user by name.',
          },
          {
            role: 'user',
            content: `Username: ${username}\nCommit message: "${commitMessage}"`,
          },
        ],
      });

      return (
        response.choices[0]?.message?.content?.trim() ??
        `Amazing work, ${username}! Keep pushing! 🚀`
      );
    } catch (err) {
      this.logger.error('OpenAI commit review failed:', err);
      return `Great commit, ${username}! You're making progress! ✨`;
    }
  }

  /**
   * Generate a personalized morning stand-up summary based on recent activity logs.
   * Called once per user per day on first login.
   */
  async generateMorningStandup(
    username: string,
    recentLogs: ActivityLog[],
  ): Promise<string> {
    const activitySummary = recentLogs
      .map(
        (log) =>
          `- ${log.actionType} (${log.xpGained} XP earned) at ${new Date(log.createdAt).toLocaleString()}`,
      )
      .join('\n');

    const prompt =
      activitySummary.length > 0
        ? `Recent activity:\n${activitySummary}`
        : 'No recent activity logged.';

    try {
      const response = await this.openai.chat.completions.create({
        model: this.model,
        max_tokens: 150,
        temperature: 0.75,
        messages: [
          {
            role: 'system',
            content:
              'You are a wholesome, cheerful virtual Gotchi assistant summarizing a developer\'s day. ' +
              'Generate a warm, encouraging morning stand-up message in 2-3 sentences. ' +
              'Mention their recent coding activity, celebrate their wins, and motivate them for the day. ' +
              'Use a cozy, "Cyber-Cozy" tone — like a cute AI friend. ' +
              'Address the user by name. Keep it concise and uplifting.',
          },
          {
            role: 'user',
            content: `Good morning, ${username}!\n${prompt}`,
          },
        ],
      });

      return (
        response.choices[0]?.message?.content?.trim() ??
        `Good morning, ${username}! Ready to build something amazing today? 🌸`
      );
    } catch (err) {
      this.logger.error('OpenAI morning standup failed:', err);
      return `Good morning, ${username}! Let's make today count! 🌟`;
    }
  }

  /**
   * Generate a burnout-aware wellness message when overwork is detected.
   */
  async generateWellnessMessage(username: string, reason: string): Promise<string> {
    try {
      const response = await this.openai.chat.completions.create({
        model: this.model,
        max_tokens: 100,
        temperature: 0.7,
        messages: [
          {
            role: 'system',
            content:
              'You are a caring Gotchi companion. A developer is overworking themselves. ' +
              'Write a warm, gentle 2-sentence message encouraging them to rest. ' +
              'Be supportive, not preachy. Mention their name.',
          },
          {
            role: 'user',
            content: `Username: ${username}, reason for concern: ${reason}`,
          },
        ],
      });

      return (
        response.choices[0]?.message?.content?.trim() ??
        `${username}, your Gotchi is worried about you. Please take a break and rest! 💙`
      );
    } catch {
      return `${username}, please rest — your Gotchi misses you! 💤`;
    }
  }
}
