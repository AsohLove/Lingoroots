import { Controller, Get, Param } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { LessonService } from './lesson.service.js';

@ApiTags('Lesson')
@Controller('units/:unitId/lessons')
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
    summary: 'Get lesson content',
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
    description: 'Lesson was not found',
  })
  findContent(
    @Param('lessonId') lessonId: string,
  ) {
    return this.lessonService.findContentByLesson(lessonId);
  }
}