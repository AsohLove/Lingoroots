import {
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import {
  ApiBearerAuth,
  ApiTags,
} from '@nestjs/swagger';

import { AuthGuard } from '../auth/guards/auth.guard.js';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.js';
import { ProgressService } from './progress.service.js';

@ApiTags('Progress')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('me/progress')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Get()
  getSummary(@Req() request: Request) {
    const user = request.user as AuthenticatedUser;
    return this.progressService.getSummary(user.id);
  }

  @Post('lessons/:lessonId/start')
  startLesson(
    @Param('lessonId') lessonId: string,
    @Req() request: Request,
  ) {
    const user = request.user as AuthenticatedUser;
    return this.progressService.startLesson(user.id, lessonId);
  }

  @Get('lessons/:lessonId')
  getLessonProgress(
    @Param('lessonId') lessonId: string,
    @Req() request: Request,
  ) {
    const user = request.user as AuthenticatedUser;
    return this.progressService.getLessonProgress(user.id, lessonId);
  }
}