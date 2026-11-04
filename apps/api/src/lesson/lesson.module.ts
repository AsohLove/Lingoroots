import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { LessonController } from './lesson.controller.js';
import { LessonService } from './lesson.service.js';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [LessonController],
  providers: [LessonService],
})
export class LessonModule {}