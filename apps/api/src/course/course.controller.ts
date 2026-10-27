import { Controller, Get, Param } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CourseService } from './course.service.js';

@ApiTags('Course')
@Controller('languages/:languageId/courses')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Get()
  @ApiOperation({
    summary: 'Get courses for a language',
  })
  @ApiParam({
    name: 'languageId',
    description: 'ID of the language',
  })
  @ApiOkResponse({
    description: 'Courses retrieved successfully',
  })
  @ApiNotFoundResponse({
    description: 'Language was not found',
  })
  async findByLanguage(@Param('languageId') languageId: string) {
    return this.courseService.findByLanguage(languageId);
  }
}