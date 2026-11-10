import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  ContributorApplicationDecision,
  ContributorApplicationStatus,
} from '../generated/prisma/client.js';

import type { AuthenticatedUser } from './types/authenticated-user.js';
import { AuthorizationService } from './authorization.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

import type { CreateContributorApplicationDto } from './dto/create-contributor-application.dto.js';
import type { UpdateContributorApplicationDto } from './dto/update-contributor-application.dto.js';
import type { ReviewContributorApplicationDto } from './dto/review-contributor-application.dto.js';
import type { RevokeAuthorizationDto } from './dto/revoke-authorization.dto.js';

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 'P2002'
  );
}

@Injectable()
export class ContributorGovernanceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authorization: AuthorizationService,
  ) {}

  private async validateScope(languageId: string, variantId?: string | null) {
    const language = await this.prisma.language.findUnique({
      where: { id: languageId },
      select: { id: true },
    });

    if (!language) {
      throw new NotFoundException('Language not found');
    }

    if (variantId) {
      const variant = await this.prisma.variant.findFirst({
        where: {
          id: variantId,
          languageId,
        },
        select: { id: true },
      });

      if (!variant) {
        throw new BadRequestException(
          'The selected variant does not belong to this language',
        );
      }
    }
  }

  async apply(dto: CreateContributorApplicationDto, user: AuthenticatedUser) {
    await this.validateScope(dto.languageId, dto.variantId);

    const existing = await this.prisma.contributorApplication.findFirst({
      where: {
        userId: user.id,
        languageId: dto.languageId,
        variantId: dto.variantId ?? null,
        status: {
          in: [
            ContributorApplicationStatus.PENDING,
            ContributorApplicationStatus.UNDER_REVIEW,
            ContributorApplicationStatus.CHANGES_REQUESTED,
          ],
        },
      },
    });

    if (existing) {
      throw new ConflictException(
        'You already have an active application for this scope',
      );
    }

    try {
      return await this.prisma.contributorApplication.create({
        data: {
          userId: user.id,
          languageId: dto.languageId,
          variantId: dto.variantId ?? null,
          expertiseStatement: dto.expertiseStatement.trim(),
          evidenceUrls: dto.evidenceUrls ?? [],
        },
        include: {
          language: true,
          variant: true,
        },
      });
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw new ConflictException(
          'You already have an active application for this scope',
        );
      }

      throw error;
    }
  }

  async getMyApplications(user: AuthenticatedUser) {
    return this.prisma.contributorApplication.findMany({
      where: { userId: user.id },
      include: {
        language: true,
        variant: true,
        reviews: {
          orderBy: { createdAt: 'desc' },
          include: {
            reviewer: {
              select: { id: true, name: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateApplication(
    applicationId: string,
    dto: UpdateContributorApplicationDto,
    user: AuthenticatedUser,
  ) {
    const application = await this.prisma.contributorApplication.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (application.userId !== user.id) {
      throw new ForbiddenException('You can only update your own application');
    }

    if (application.status !== ContributorApplicationStatus.CHANGES_REQUESTED) {
      throw new ConflictException(
        'Only applications with requested changes can be updated',
      );
    }

    const languageId = dto.languageId ?? application.languageId;
    const variantId =
      dto.variantId === undefined ? application.variantId : dto.variantId;

    await this.validateScope(languageId, variantId);

    return this.prisma.contributorApplication.update({
      where: { id: applicationId },
      data: {
        languageId,
        variantId,
        expertiseStatement:
          dto.expertiseStatement?.trim() ?? application.expertiseStatement,
        evidenceUrls: dto.evidenceUrls ?? application.evidenceUrls,
        status: ContributorApplicationStatus.PENDING,
        submittedAt: new Date(),
      },
      include: {
        language: true,
        variant: true,
      },
    });
  }

  async getAdminApplications(user: AuthenticatedUser) {
    this.authorization.requireRole(user, 'ADMINISTRATOR');

    return this.prisma.contributorApplication.findMany({
      where: {
        status: {
          in: [
            ContributorApplicationStatus.PENDING,
            ContributorApplicationStatus.UNDER_REVIEW,
          ],
        },
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        language: true,
        variant: true,
        reviews: {
          orderBy: { createdAt: 'desc' },
          include: {
            reviewer: {
              select: { id: true, name: true },
            },
          },
        },
      },
      orderBy: { submittedAt: 'asc' },
    });
  }

  async reviewApplication(
    applicationId: string,
    dto: ReviewContributorApplicationDto,
    admin: AuthenticatedUser,
  ) {
    this.authorization.requireRole(admin, 'ADMINISTRATOR');

    const application = await this.prisma.contributorApplication.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (
      application.status !== ContributorApplicationStatus.PENDING &&
      application.status !== ContributorApplicationStatus.UNDER_REVIEW
    ) {
      throw new ConflictException(
        'This application is no longer awaiting a decision',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      let nextStatus: ContributorApplicationStatus;

      const claimed = await tx.contributorApplication.updateMany({
        where: {
          id: applicationId,
          status: {
            in: ['PENDING', 'UNDER_REVIEW'],
          },
        },
        data: {
          status: dto.decision,
        },
      });

      if (claimed.count !== 1) {
        throw new ConflictException(
          'This application has already been reviewed or is no longer available',
        );
      }

      switch (dto.decision) {
        case ContributorApplicationDecision.APPROVED:
          nextStatus = ContributorApplicationStatus.APPROVED;
          break;
        case ContributorApplicationDecision.CHANGES_REQUESTED:
          nextStatus = ContributorApplicationStatus.CHANGES_REQUESTED;
          break;
        case ContributorApplicationDecision.REJECTED:
          nextStatus = ContributorApplicationStatus.REJECTED;
          break;
      }

      if (dto.decision === ContributorApplicationDecision.APPROVED) {
        await tx.userRole.upsert({
          where: {
            userId_role: {
              userId: application.userId,
              role: 'CONTRIBUTOR',
            },
          },
          update: {},
          create: {
            userId: application.userId,
            role: 'CONTRIBUTOR',
          },
        });

        const existingGrant = await tx.languageAuthorization.findFirst({
          where: {
            userId: application.userId,
            languageId: application.languageId,
            variantId: application.variantId,
            revokedAt: null,
          },
        });

        if (existingGrant) {
          await tx.languageAuthorization.update({
            where: { id: existingGrant.id },
            data: {
              applicationId: application.id,
              grantedById: admin.id,
            },
          });
        } else {
          await tx.languageAuthorization.create({
            data: {
              userId: application.userId,
              languageId: application.languageId,
              variantId: application.variantId,
              applicationId: application.id,
              grantedById: admin.id,
            },
          });
        }
      }

      await tx.contributorApplicationReview.create({
        data: {
          applicationId,
          reviewerId: admin.id,
          decision: dto.decision,
          comment: dto.comment.trim(),
        },
      });

      return tx.contributorApplication.update({
        where: { id: applicationId },
        data: { status: nextStatus },
        include: {
          language: true,
          variant: true,
          reviews: {
            orderBy: { createdAt: 'desc' },
          },
        },
      });
    });
  }

  async revokeAuthorization(
    authorizationId: string,
    dto: RevokeAuthorizationDto,
    admin: AuthenticatedUser,
  ) {
    this.authorization.requireRole(admin, 'ADMINISTRATOR');

    const grant = await this.prisma.languageAuthorization.findUnique({
      where: { id: authorizationId },
    });

    if (!grant) {
      throw new NotFoundException('Authorization not found');
    }

    if (grant.revokedAt) {
      throw new ConflictException('Authorization has already been revoked');
    }

    const revoked = await this.prisma.languageAuthorization.updateMany({
      where: {
        id: authorizationId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
        revokedById: admin.id,
        revocationReason: dto.reason.trim(),
      },
    });

    if (revoked.count !== 1) {
      throw new ConflictException(
        'This authorization has already been revoked or does not exist',
      );
    }

    return this.prisma.languageAuthorization.findUnique({
      where: { id: authorizationId },
    });
  }
}
