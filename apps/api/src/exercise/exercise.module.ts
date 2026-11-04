import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { ExerciseController } from './exercise.controller.js';
import { ExerciseService } from './exercise.service.js';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [ExerciseController],
  providers: [ExerciseService],
  exports: [ExerciseService],
})
export class ExerciseModule {}