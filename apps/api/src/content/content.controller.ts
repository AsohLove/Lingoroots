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
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { AuthGuard } from '../auth/guards/auth.guard.js';
import { ContentService } from './content.service.js';
import { CreateVocabularyDto } from './dto/create-vocabulary.dto.js';
import { UpdateVocabularyDto } from './dto/update-vocabulary.dto.js';

@ApiTags('Content')
@ApiBearerAuth()
@Controller()
@UseGuards(AuthGuard)
export class ContentController {
  constructor(
    private readonly contentService: ContentService,
  ) {}

  @Post('lessons/:lessonId/vocabulary')
  @ApiOperation({
    summary: 'Create vocabulary content',
  })
  createVocabulary(
    @Param('lessonId') lessonId: string,
    @Body() dto: CreateVocabularyDto,
    @Req() request: Request,
  ) {
    return this.contentService.createVocabulary(
      lessonId,
      dto,
      request.user!,
    );
  }

  @Get('lessons/:lessonId/vocabulary')
  @ApiOperation({
    summary: 'Get published vocabulary for a lesson',
  })
  getVocabulary(
    @Param('lessonId') lessonId: string,
  ) {
    return this.contentService.getVocabularyForLesson(
      lessonId,
    );
  }

  @Patch('vocabulary/:vocabularyId')
  @ApiOperation({
    summary: 'Update vocabulary content',
  })
  updateVocabulary(
    @Param('vocabularyId') vocabularyId: string,
    @Body() dto: UpdateVocabularyDto,
    @Req() request: Request,
  ) {
    return this.contentService.updateVocabulary(
      vocabularyId,
      dto,
      request.user!,
    );
  }

  @Post('vocabulary/:vocabularyId/submit')
  @ApiOperation({
    summary: 'Submit vocabulary for review',
  })
  submitVocabulary(
    @Param('vocabularyId') vocabularyId: string,
    @Req() request: Request,
  ) {
    return this.contentService.submitVocabulary(
      vocabularyId,
      request.user!,
    );
  }
}