import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { Gotchi } from '@prisma/client';

interface UpdateGotchiData {
  name?: string;
  theme?: string;
  mood?: number;
  energy?: number;
  outfitId?: string;
}

@Injectable()
export class GotchiService {
  constructor(private readonly prisma: PrismaService) {}

  async getGotchiByUserId(userId: string): Promise<Gotchi> {
    const gotchi = await this.prisma.gotchi.findUnique({
      where: { userId },
      include: { outfit: true },
    });

    if (!gotchi) {
      throw new NotFoundException(`No Gotchi found for user ${userId}`);
    }

    return gotchi;
  }

  async updateGotchi(userId: string, data: UpdateGotchiData): Promise<Gotchi> {
    const gotchi = await this.prisma.gotchi.findUnique({ where: { userId } });

    if (!gotchi) {
      throw new NotFoundException(`No Gotchi found for user ${userId}`);
    }

    return this.prisma.gotchi.update({
      where: { id: gotchi.id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.theme !== undefined && { theme: data.theme }),
        ...(data.mood !== undefined && { mood: Math.max(0, Math.min(100, data.mood)) }),
        ...(data.energy !== undefined && { energy: Math.max(0, Math.min(100, data.energy)) }),
        ...(data.outfitId !== undefined && { outfitId: data.outfitId }),
      },
    });
  }

  /** Gradually restore gotchi mood/energy over time — called via cron */
  async restoreGotchiStats(): Promise<void> {
    // Restore 2 energy and 1 mood per hour for all gotchis
    await this.prisma.$executeRaw`
      UPDATE gotchis 
      SET 
        energy = LEAST(100, energy + 2),
        mood = LEAST(100, mood + 1)
    `;
  }
}
