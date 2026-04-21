import { Module } from '@nestjs/common';
import { GithubWebhookController } from './github-webhook.controller';
import { GithubService } from './github.service';
import { LanguageDetectorService } from './language-detector.service';
import { EventsModule } from '../events/events.module';
import { PomodoroModule } from '../pomodoro/pomodoro.module';
import { AiMentorModule } from '../ai-mentor/ai-mentor.module';
import { GotchiModule } from '../gotchi/gotchi.module';

@Module({
  imports: [EventsModule, PomodoroModule, AiMentorModule, GotchiModule],
  controllers: [GithubWebhookController],
  providers: [GithubService, LanguageDetectorService],
  exports: [GithubService],
})
export class GithubModule {}
