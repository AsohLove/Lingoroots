import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { AuthGuard } from './guards/auth.guard.js';
import { RolesGuard } from './guards/roles.guard.js';
import { AuthorizationService } from './authorization.service.js';
import { EmailService } from '../email/email.service.js';
import { ContributorGovernanceController } from './contributor-governance.controller.js';
import { ContributorGovernanceService } from './contributor-governance.service.js';

@Module({
  imports: [PrismaModule],
  controllers: [AuthController, ContributorGovernanceController],
  providers: [AuthService, AuthGuard, RolesGuard, AuthorizationService, EmailService, ContributorGovernanceService],
  exports: [AuthService, AuthGuard, RolesGuard, AuthorizationService, EmailService, ContributorGovernanceService],
})
export class AuthModule {}