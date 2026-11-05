import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
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

import { CreateExerciseDto } from './dto/create-exercise.dto.js';
import { UpdateExerciseDto } from './dto/update-exercise.dto.js';
import { SubmitAnswerDto } from './dto/submit-answer.dto.js';
import { ReviewExerciseDto } from './dto/review-exercise.dto.js';
import { ExerciseService } from './exercise.service.js';

@ApiTags('Exercises')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller()
export class ExerciseController {
  constructor(private readonly exerciseService: ExerciseService) {}

  @Get('lessons/:lessonId/exercises')
  findPublishedByLesson(@Param('lessonId') lessonId: string) {
    return this.exerciseService.findPublishedByLesson(lessonId);
  }

  @Post('lessons/:lessonId/exercises')
  create(
    @Param('lessonId') lessonId: string,
    @Body() dto: CreateExerciseDto,
    @Req() request: Request,
  ) {
    return this.exerciseService.create(
      lessonId,
      dto,
      request.user as AuthenticatedUser,
    );
  }

  @Patch('exercises/:exerciseId')
  update(
    @Param('exerciseId') exerciseId: string,
    @Body() dto: UpdateExerciseDto,
    @Req() request: Request,
  ) {
    return this.exerciseService.update(
      exerciseId,
      dto,
      request.user as AuthenticatedUser,
    );
  }

  @Post('exercises/:exerciseId/submit')
  submit(@Param('exerciseId') exerciseId: string, @Req() request: Request) {
    return this.exerciseService.submit(
      exerciseId,
      request.user as AuthenticatedUser,
    );
  }

  @Post('exercises/:exerciseId/versions')
  createVersion(
    @Param('exerciseId') exerciseId: string,
    @Req() request: Request,
  ) {
    return this.exerciseService.createVersion(
      exerciseId,
      request.user as AuthenticatedUser,
    );
  }

  @Post('exercises/:exerciseId/attempts')
  submitAttempt(
    @Param('exerciseId') exerciseId: string,
    @Body() dto: SubmitAnswerDto,
    @Req() request: Request,
  ) {
    return this.exerciseService.submitAttempt(
      exerciseId,
      dto,
      request.user as AuthenticatedUser,
    );
  }

  @Get('content-review/exercises')
  getReviewQueue(@Req() request: Request) {
    return this.exerciseService.getReviewQueue(
      request.user as AuthenticatedUser,
    );
  }

  @Post('content-review/exercises/:exerciseId/start')
  startReview(
    @Param('exerciseId') exerciseId: string,
    @Req() request: Request,
  ) {
    return this.exerciseService.startReview(
      exerciseId,
      request.user as AuthenticatedUser,
    );
  }

  @Post('content-review/exercises/:exerciseId/approve')
  approve(
    @Param('exerciseId') exerciseId: string,
    @Body() dto: ReviewExerciseDto,
    @Req() request: Request,
  ) {
    return this.exerciseService.review(
      exerciseId,
      'approve',
      dto.comment,
      request.user as AuthenticatedUser,
    );
  }

  @Post('content-review/exercises/:exerciseId/request-changes')
  requestChanges(
    @Param('exerciseId') exerciseId: string,
    @Body() dto: ReviewExerciseDto,
    @Req() request: Request,
  ) {
    return this.exerciseService.review(
      exerciseId,
      'changes',
      dto.comment,
      request.user as AuthenticatedUser,
    );
  }

  @Post('content-review/exercises/:exerciseId/reject')
  reject(
    @Param('exerciseId') exerciseId: string,
    @Body() dto: ReviewExerciseDto,
    @Req() request: Request,
  ) {
    return this.exerciseService.review(
      exerciseId,
      'reject',
      dto.comment,
      request.user as AuthenticatedUser,
    );
  }

  @Get('me/exercises')
  getMyExercises(@Req() request: Request) {
    return this.exerciseService.getMyExercises(
      request.user as AuthenticatedUser,
    );
  }
}