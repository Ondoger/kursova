import { Module } from '@nestjs/common';
import { AiMentorService } from './ai-mentor.service';

@Module({
  providers: [AiMentorService],
  exports: [AiMentorService],
})
export class AiMentorModule {}
