import { Module } from '@nestjs/common';
import { LanguageController } from './language.controller.js';
import { LanguageService } from './language.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [LanguageController],
  providers: [LanguageService],
})
export class LanguageModule {}
