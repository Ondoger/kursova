import {
  Controller,
  Post,
  Headers,
  Req,
  RawBodyRequest,
  HttpCode,
  HttpStatus,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Request } from 'express';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import { GithubService } from './github.service';

// ---- Webhook payload types ----

interface GitHubCommit {
  id: string;
  message: string;
  author: { name: string; email: string };
  timestamp: string;
  added?: string[];
  removed?: string[];
  modified?: string[];
}

interface GitHubPushPayload {
  ref: string;
  repository: { id: number; full_name: string };
  pusher: { name: string; email: string };
  commits: GitHubCommit[];
  sender: { login: string; id: number };
}

interface GitHubWorkflowRunPayload {
  action: string;
  workflow_run: {
    id: number;
    name: string;
    conclusion: 'success' | 'failure' | 'cancelled' | 'skipped' | null;
    status: string;
  };
  repository: { id: number; full_name: string };
  sender: { login: string; id: number };
}

type GitHubWebhookPayload = GitHubPushPayload | GitHubWorkflowRunPayload;

@Controller('webhooks/github')
export class GithubWebhookController {
  private readonly logger = new Logger(GithubWebhookController.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly githubService: GithubService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Headers('x-github-event') eventType: string,
    @Headers('x-hub-signature-256') signature: string,
    @Req() req: RawBodyRequest<Request>,
  ): Promise<{ status: string }> {
    // Validate HMAC signature
    this.verifySignature(req.rawBody, signature);

    const payload = req.body as GitHubWebhookPayload;
    this.logger.log(`Received GitHub event: ${eventType}`);

    switch (eventType) {
      case 'push':
        await this.githubService.handlePushEvent(payload as GitHubPushPayload);
        break;

      case 'workflow_run':
        await this.githubService.handleWorkflowRunEvent(
          payload as GitHubWorkflowRunPayload,
        );
        break;

      case 'ping':
        this.logger.log('GitHub webhook ping received — handshake complete.');
        break;

      default:
        this.logger.debug(`Unhandled event type: ${eventType}`);
    }

    return { status: 'ok' };
  }

  /** Verify X-Hub-Signature-256 header against raw request body */
  private verifySignature(
    rawBody: Buffer | undefined,
    signatureHeader: string,
  ): void {
    const secret = this.configService.getOrThrow<string>('GITHUB_WEBHOOK_SECRET');

    if (!rawBody || !signatureHeader) {
      throw new BadRequestException('Missing signature or body.');
    }

    const expectedSignature =
      'sha256=' +
      crypto.createHmac('sha256', secret).update(rawBody).digest('hex');

    const isValid = crypto.timingSafeEqual(
      Buffer.from(signatureHeader),
      Buffer.from(expectedSignature),
    );

    if (!isValid) {
      this.logger.warn('Invalid webhook signature — rejecting request.');
      throw new BadRequestException('Invalid webhook signature.');
    }
  }
}
