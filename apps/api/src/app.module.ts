import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { LanguageModule } from './language/language.module.js';
import { CourseModule } from './course/course.module.js';
import { UnitModule } from './unit/unit.module.js';


@Module({
  imports: [PrismaModule, LanguageModule, CourseModule, UnitModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
