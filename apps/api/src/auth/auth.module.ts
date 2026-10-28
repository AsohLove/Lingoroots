import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { AuthGuard } from './guards/auth.guard.js';
import { RolesGuard } from './guards/roles.guard.js';
import { AuthorizationService } from './authorization.service.js';

@Module({
  imports: [PrismaModule],
  controllers: [AuthController],
  providers: [AuthService, AuthGuard, RolesGuard, AuthorizationService],
  exports: [AuthService, AuthGuard, RolesGuard, AuthorizationService],
})
export class AuthModule {}