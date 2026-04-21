import { Module } from '@nestjs/common';
import { WellnessService } from './wellness.service';
import { AiMentorModule } from '../ai-mentor/ai-mentor.module';

@Module({
  imports: [AiMentorModule],
  providers: [WellnessService],
  exports: [WellnessService],
})
export class PomodoroModule {}
