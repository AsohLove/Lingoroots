import { Module } from '@nestjs/common';
import { LevelService } from './level.service.js';
import { LevelController } from './level.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  providers: [LevelService],
  controllers: [LevelController]
})
export class LevelModule {}
