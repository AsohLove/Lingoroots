import { Controller, Get, Param } from '@nestjs/common';
import { LessonService } from './lesson.service.js';

@Controller('units/:unitId/lessons')
export class LessonController {
  constructor(private readonly lessonService: LessonService) {}

  @Get()
  findByUnit(@Param('unitId') unitId: string) {
    return this.lessonService.findByUnit(unitId);
  }
}