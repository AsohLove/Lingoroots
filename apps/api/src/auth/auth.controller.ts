
import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import {
  ApiAcceptedResponse,
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { AuthService } from './auth.service.js';
import { AuthorizationService } from './authorization.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { VerifyEmailDto } from './dto/verify-email.dto.js';
import { ResendVerificationDto } from './dto/resend-verification.dto.js';
import { AuthGuard } from './guards/auth.guard.js';

const SESSION_COOKIE = 'session_id';
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 30;

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly authorizationService: AuthorizationService,
  ) {}

  private setSessionCookie(response: Response, sessionId: string) {
    response.cookie(SESSION_COOKIE, sessionId, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: SESSION_DURATION_MS,
    });
  }

  private getSessionId(request: Request): string | undefined {
    const authorization = request.headers.authorization;

    if (authorization?.startsWith('Bearer ')) {
      const token = authorization.slice('Bearer '.length).trim();

      if (token) {
        return token;
      }
    }

    return request.cookies?.[SESSION_COOKIE];
  }

  @Post('register')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({
    summary: 'Register a learner and initiate email verification delivery',
  })
  @ApiAcceptedResponse({
    description: 'Registration request accepted',
  })
  @ApiBadRequestResponse({
    description: 'Invalid registration data',
  })
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(
      registerDto.name,
      registerDto.email,
      registerDto.password,
    );
  }

  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify an email address and sign in automatically',
  })
  @ApiOkResponse({
    description: 'Email verified and authenticated session created',
  })
  @ApiBadRequestResponse({
    description: 'Invalid or expired verification code',
  })
  async verifyEmail(
    @Body() dto: VerifyEmailDto,
    @Headers('x-client-type') clientType: string | undefined,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.verifyEmail(
      dto.email,
      dto.code,
    );

    // Verification now creates a session, just like a successful login.
    this.setSessionCookie(response, result.sessionId);

    const user = await this.authService.getCurrentUser(
      result.sessionId,
    );

    return {
      message: result.message,
      user,
      ...(clientType?.toLowerCase() === 'mobile'
        ? { sessionToken: result.sessionId }
        : {}),
    };
  }

  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Resend an email verification code',
  })
  @ApiOkResponse({
    description: 'Request processed',
  })
  resendVerification(@Body() dto: ResendVerificationDto) {
    return this.authService.resendVerification(dto.email);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Log in to a verified learner account',
  })
  @ApiOkResponse({
    description: 'Login successful',
  })
  @ApiForbiddenResponse({
    description: 'Email verification is required',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid email or password',
  })
  async login(
    @Body() loginDto: LoginDto,
    @Headers('x-client-type') clientType: string | undefined,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.login(
      loginDto.email,
      loginDto.password,
    );

    this.setSessionCookie(response, result.sessionId);

    return {
      user: result.user,
      ...(clientType?.toLowerCase() === 'mobile'
        ? { sessionToken: result.sessionId }
        : {}),
    };
  }

  @Get('me')
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Get the currently authenticated user',
  })
  @ApiOkResponse({
    description: 'Authenticated user retrieved successfully',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication is required',
  })
  me(@Req() request: Request) {
    return request.user;
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Log out the currently authenticated user',
  })
  @ApiOkResponse({
    description: 'Logged out successfully',
  })
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const sessionId = this.getSessionId(request);

    if (sessionId) {
      await this.authService.logout(sessionId);
    }

    response.clearCookie(SESSION_COOKIE, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });

    return {
      message: 'Logged out successfully',
    };
  }

  @Get('me/authorizations')
  @UseGuards(AuthGuard)
  async getMyAuthorizations(@Req() request: Request) {
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException();
    }

    return this.authorizationService.getUserAuthorizations(user.id);
  }
}
