import { Controller, Get, Param } from '@nestjs/common';
import { CourseService } from './course.service.js';

@Controller('languages/:languageId/courses')
export class CourseController { 
    constructor(private readonly courseService: CourseService) {}

    @Get()
    async findByLanguage(@Param('languageId') languageId: string) {
        return this.courseService.findByLanguage(languageId);
    }
}
