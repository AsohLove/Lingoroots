import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from '../auth.service.js';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
  ) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request =
      context.switchToHttp().getRequest<Request>();

    const sessionId =
      request.cookies?.session_id;

    if (!sessionId) {
      throw new UnauthorizedException(
        'Authentication is required',
      );
    }

    const user =
      await this.authService.getCurrentUser(sessionId);

    request.user = user;

    return true;
  }
}