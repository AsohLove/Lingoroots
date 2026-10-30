import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { LanguageModule } from './language/language.module.js';
import { CourseModule } from './course/course.module.js';
import { UnitModule } from './unit/unit.module.js';
import { LessonModule } from './lesson/lesson.module.js';
import { AppConfigModule } from './config/config.module.js';
import { HealthModule } from './health/health.module.js';
import { AuthModule } from './auth/auth.module.js';
import { ContentModule } from './content/content.module.js';
import { LevelModule } from './level/level.module.js';


@Module({
  imports: [AppConfigModule, 
            PrismaModule, 
            LanguageModule, 
            CourseModule, 
            UnitModule, 
            LessonModule,
            HealthModule,
            AuthModule,
            ContentModule,
            LevelModule,
          ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
