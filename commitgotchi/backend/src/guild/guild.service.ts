import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { Guild } from '@prisma/client';

interface CreateGuildDto {
  name: string;
  description?: string;
}

@Injectable()
export class GuildService {
  constructor(private readonly prisma: PrismaService) {}

  async createGuild(creatorId: string, dto: CreateGuildDto): Promise<Guild> {
    const existing = await this.prisma.guild.findUnique({
      where: { name: dto.name },
    });

    if (existing) {
      throw new ConflictException(`Guild "${dto.name}" already exists.`);
    }

    const guild = await this.prisma.guild.create({
      data: {
        name: dto.name,
        description: dto.description,
        members: { connect: { id: creatorId } },
      },
    });

    await this.prisma.activityLog.create({
      data: {
        userId: creatorId,
        actionType: 'GUILD_JOINED',
        xpGained: 25,
        coinsGained: 50,
        metadata: JSON.stringify({ guildId: guild.id, guildName: guild.name, role: 'founder' }),
      },
    });

    return guild;
  }

  async getAllGuilds(): Promise<Guild[]> {
    return this.prisma.guild.findMany({
      include: { _count: { select: { members: true } } },
      orderBy: { totalXP: 'desc' },
    });
  }

  async getGuildById(
    id: string,
  ): Promise<Guild & { members: object[] }> {
    const guild = await this.prisma.guild.findUnique({
      where: { id },
      include: {
        members: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
            level: true,
            totalXP: true,
          },
          orderBy: { totalXP: 'desc' },
        },
      },
    });

    if (!guild) {
      throw new NotFoundException(`Guild ${id} not found.`);
    }

    return guild as Guild & { members: object[] };
  }

  async joinGuild(userId: string, guildId: string): Promise<void> {
    const guild = await this.prisma.guild.findUnique({ where: { id: guildId } });
    if (!guild) throw new NotFoundException(`Guild ${guildId} not found.`);

    await this.prisma.user.update({
      where: { id: userId },
      data: { guildId },
    });

    await this.prisma.activityLog.create({
      data: {
        userId,
        actionType: 'GUILD_JOINED',
        xpGained: 10,
        coinsGained: 0,
        metadata: JSON.stringify({ guildId, guildName: guild.name }),
      },
    });
  }
}
