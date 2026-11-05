import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { AuthGuard } from '../auth/guards/auth.guard.js';
import { LessonService } from './lesson.service.js';

@ApiTags('Lesson')
@ApiBearerAuth()
@Controller('units/:unitId/lessons')
@UseGuards(AuthGuard)
export class LessonController {
  constructor(private readonly lessonService: LessonService) {}

  @Get()
  @ApiOperation({
    summary: 'Get lessons for a unit',
  })
  @ApiParam({
    name: 'unitId',
    description: 'ID of the unit',
  })
  @ApiOkResponse({
    description: 'Lessons retrieved successfully',
  })
  @ApiNotFoundResponse({
    description: 'Unit was not found',
  })
  findByUnit(@Param('unitId') unitId: string) {
    return this.lessonService.findByUnit(unitId);
  }

  @Get(':lessonId/content')
  @ApiOperation({
    summary: 'Get published content for a lesson',
  })
  @ApiParam({
    name: 'unitId',
    description: 'ID of the unit',
  })
  @ApiParam({
    name: 'lessonId',
    description: 'ID of the lesson',
  })
  @ApiOkResponse({
    description: 'Lesson content retrieved successfully',
  })
  @ApiNotFoundResponse({
    description: 'Lesson was not found in this unit',
  })
  findContent(
    @Param('unitId') unitId: string,
    @Param('lessonId') lessonId: string,
  ) {
    return this.lessonService.findContentByLesson(unitId, lessonId);
  }
}