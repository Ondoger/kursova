import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GuildService } from './guild.service';
import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';
import { Request } from 'express';
import type { User } from '@prisma/client';

class CreateGuildDto {
  @IsString()
  @MinLength(2)
  @MaxLength(32)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string;
}

interface RequestWithUser extends Request {
  user: User;
}

@Controller('guilds')
@UseGuards(JwtAuthGuard)
export class GuildController {
  constructor(private readonly guildService: GuildService) {}

  @Get()
  async getAllGuilds(): Promise<object[]> {
    return this.guildService.getAllGuilds();
  }

  @Get(':id')
  async getGuild(@Param('id') id: string): Promise<object> {
    return this.guildService.getGuildById(id);
  }

  @Post()
  async createGuild(
    @Req() req: RequestWithUser,
    @Body() dto: CreateGuildDto,
  ): Promise<object> {
    return this.guildService.createGuild(req.user.id, dto);
  }

  @Post(':id/join')
  @HttpCode(HttpStatus.NO_CONTENT)
  async joinGuild(
    @Req() req: RequestWithUser,
    @Param('id') guildId: string,
  ): Promise<void> {
    await this.guildService.joinGuild(req.user.id, guildId);
  }
}
