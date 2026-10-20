import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { LanguageModule } from './language/language.module.js';


@Module({
  imports: [PrismaModule, LanguageModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
