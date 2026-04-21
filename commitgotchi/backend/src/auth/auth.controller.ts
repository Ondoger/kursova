import {
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import type { User } from '@prisma/client';

interface RequestWithUser extends Request {
  user: User;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /** Step 1: Redirect to GitHub OAuth */
  @Get('github')
  @UseGuards(AuthGuard('github'))
  initiateGithubLogin(): void {
    // Passport handles redirect
  }

  /** Step 2: GitHub callback — sets JWT in httpOnly cookie */
  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  async githubCallback(
    @Req() req: RequestWithUser,
    @Res() res: Response,
  ): Promise<void> {
    const { accessToken, morningMessage } = await this.authService.login(req.user);

    // Set JWT as httpOnly cookie (CSRF protection)
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Redirect to frontend dashboard
    const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000';
    const redirectUrl = new URL('/dashboard', frontendUrl);
    if (morningMessage) {
      redirectUrl.searchParams.set('morning', '1');
    }

    res.redirect(redirectUrl.toString());
  }

  /** Get current user profile */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Req() req: RequestWithUser): Promise<object> {
    return this.authService.getProfile(req.user.id);
  }

  /** Logout — clear cookie */
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  logout(@Res({ passthrough: true }) res: Response): void {
    res.clearCookie('access_token');
  }
}
