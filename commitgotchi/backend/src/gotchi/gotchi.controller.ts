import {
  Controller,
  Get,
  Patch,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GotchiService } from './gotchi.service';
import { IsInt, IsString, Max, Min, IsOptional } from 'class-validator';
import { Request } from 'express';
import type { User } from '@prisma/client';

class UpdateGotchiDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  theme?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  mood?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  energy?: number;

  @IsOptional()
  @IsString()
  outfitId?: string;
}

interface RequestWithUser extends Request {
  user: User;
}

@Controller('gotchi')
@UseGuards(JwtAuthGuard)
export class GotchiController {
  constructor(private readonly gotchiService: GotchiService) {}

  @Get('me')
  async getMyGotchi(@Req() req: RequestWithUser): Promise<object> {
    return this.gotchiService.getGotchiByUserId(req.user.id);
  }

  @Patch('me')
  async updateGotchi(
    @Req() req: RequestWithUser,
    @Body() dto: UpdateGotchiDto,
  ): Promise<object> {
    return this.gotchiService.updateGotchi(req.user.id, dto);
  }
}
