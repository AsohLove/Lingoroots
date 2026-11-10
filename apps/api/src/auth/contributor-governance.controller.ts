import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { AuthGuard } from './guards/auth.guard.js';
import { RolesGuard } from './guards/roles.guard.js';
import { Roles } from './decorators/roles.decorator.js';

import { ContributorGovernanceService } from './contributor-governance.service.js';
import { CreateContributorApplicationDto } from './dto/create-contributor-application.dto.js';
import { UpdateContributorApplicationDto } from './dto/update-contributor-application.dto.js';
import { ReviewContributorApplicationDto } from './dto/review-contributor-application.dto.js';
import { RevokeAuthorizationDto } from './dto/revoke-authorization.dto.js';

@ApiTags('Contributor Governance')
@ApiBearerAuth()
@Controller()
@UseGuards(AuthGuard)
export class ContributorGovernanceController {
  constructor(private readonly governance: ContributorGovernanceService) {}

  @Post('contributor-applications')
  apply(@Body() dto: CreateContributorApplicationDto, @Req() request: Request) {
    return this.governance.apply(dto, request.user!);
  }

  @Get('me/contributor-applications')
  getMine(@Req() request: Request) {
    return this.governance.getMyApplications(request.user!);
  }

  @Patch('contributor-applications/:applicationId')
  update(
    @Param('applicationId') applicationId: string,
    @Body() dto: UpdateContributorApplicationDto,
    @Req() request: Request,
  ) {
    return this.governance.updateApplication(applicationId, dto, request.user!);
  }

  @Get('admin/contributor-applications')
  @UseGuards(RolesGuard)
  @Roles('ADMINISTRATOR')
  getAdminQueue(@Req() request: Request) {
    return this.governance.getAdminApplications(request.user!);
  }

  @Post('admin/contributor-applications/:applicationId/review')
  @UseGuards(RolesGuard)
  @Roles('ADMINISTRATOR')
  review(
    @Param('applicationId') applicationId: string,
    @Body() dto: ReviewContributorApplicationDto,
    @Req() request: Request,
  ) {
    return this.governance.reviewApplication(applicationId, dto, request.user!);
  }

  @Get('admin/authorizations')
  @UseGuards(RolesGuard)
  @Roles('ADMINISTRATOR')
  getAdminAuthorizations(@Req() request: Request) {
    return this.governance.getAdminAuthorizations(request.user!);
  }

  @Post('admin/authorizations/:authorizationId/revoke')
  @UseGuards(RolesGuard)
  @Roles('ADMINISTRATOR')
  revoke(
    @Param('authorizationId') authorizationId: string,
    @Body() dto: RevokeAuthorizationDto,
    @Req() request: Request,
  ) {
    return this.governance.revokeAuthorization(
      authorizationId,
      dto,
      request.user!,
    );
  }

}
