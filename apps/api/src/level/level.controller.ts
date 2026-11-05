import { Controller, Get, Param } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { LevelService } from './level.service.js';

@ApiTags('Level')
@Controller('courses/:courseId/levels')
export class LevelController {
  constructor(private readonly levelService: LevelService) {}

  @Get()
  @ApiOperation({
    summary: 'Get levels for a course',
  })
  @ApiParam({
    name: 'courseId',
    description: 'ID of the course',
  })
  @ApiOkResponse({
    description: 'Levels retrieved successfully',
  })
  @ApiNotFoundResponse({
    description: 'Course was not found',
  })
  findByCourse(@Param('courseId') courseId: string) {
    return this.levelService.findByCourse(courseId);
  }
}