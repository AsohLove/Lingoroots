import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { ContentController } from './content.controller.js';
import { ContentService } from './content.service.js';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
  ],
  controllers: [
    ContentController,
  ],
  providers: [
    ContentService,
  ],
  exports: [
    ContentService,
  ],
})
export class ContentModule {}