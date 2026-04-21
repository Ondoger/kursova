import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { GithubModule } from './github/github.module';
import { EventsModule } from './events/events.module';
import { GotchiModule } from './gotchi/gotchi.module';
import { GuildModule } from './guild/guild.module';
import { AiMentorModule } from './ai-mentor/ai-mentor.module';
import { PomodoroModule } from './pomodoro/pomodoro.module';

@Module({
  imports: [
    // Global config from .env
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Cron jobs (wellness guard)
    ScheduleModule.forRoot(),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 10,
      },
      {
        name: 'medium',
        ttl: 10000,
        limit: 50,
      },
    ]),

    PrismaModule,
    AuthModule,
    GithubModule,
    EventsModule,
    GotchiModule,
    GuildModule,
    AiMentorModule,
    PomodoroModule,
  ],
})
export class AppModule {}
