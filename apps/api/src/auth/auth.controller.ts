import {
  Body,
  Controller,
  Post,
  Res,
  Get,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { Response, Request } from 'express';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { AuthGuard } from './guards/auth.guard.js';
import { AuthorizationService } from './authorization.service.js';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly authorizationService: AuthorizationService,
  ) {}

  @Post('register')
  @ApiOperation({
    summary: 'Create a learner account',
  })
  @ApiCreatedResponse({
    description: 'Account created successfully',
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

  @Post('login')
  @ApiOperation({
    summary: 'Log in to a learner account',
  })
  @ApiCreatedResponse({
    description: 'Login successful',
  })
  @ApiBadRequestResponse({
    description: 'Invalid login data',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid email or password',
  })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.login(
      loginDto.email,
      loginDto.password,
    );

    response.cookie('session_id', result.sessionId, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24 * 30,
    });

    return {
      user: result.user,
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
  async me(@Req() request: Request) {
    return request.user;
  }

  @Post('logout')
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
    const sessionId = request.cookies?.session_id;

    if (sessionId) {
      await this.authService.logout(sessionId);
    }

    response.clearCookie('session_id', {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
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
