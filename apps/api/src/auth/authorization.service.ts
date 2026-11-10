import { ForbiddenException, Injectable } from '@nestjs/common';
import type { Role } from '../generated/prisma/client.js';
import type { AuthenticatedUser } from './types/authenticated-user.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class AuthorizationService {
  constructor(private readonly prisma: PrismaService) {}

  hasRole(user: AuthenticatedUser, role: Role): boolean {
    return user.roles.includes(role);
  }

  async hasLanguageAccess(
    userId: string,
    languageId: string,
  ): Promise<boolean> {
    const authorization = await this.prisma.languageAuthorization.findFirst({
      where: {
        userId,
        languageId,
        variantId: null,
        revokedAt: null,
      },
    });

    return authorization !== null;
  }

  async hasVariantAccess(
    userId: string,
    languageId: string,
    variantId: string,
  ): Promise<boolean> {
    const authorization = await this.prisma.languageAuthorization.findFirst({
      where: {
        userId,
        languageId,
        revokedAt: null,
        OR: [{ variantId: null }, { variantId }],
      },
    });

    return authorization !== null;
  }

  async hasCourseAccess(
    userId: string,
    languageId: string,
    variantId: string | null,
  ): Promise<boolean> {
    if (variantId === null) {
      return this.hasLanguageAccess(userId, languageId);
    }

    return this.hasVariantAccess(userId, languageId, variantId);
  }

  requireRole(user: AuthenticatedUser, role: Role): void {
    if (!this.hasRole(user, role)) {
      throw new ForbiddenException('You do not have the required role');
    }
  }

  async requireLanguageAccess(
    userId: string,
    languageId: string,
    _variantId: string | null,
  ): Promise<void> {
    if (!(await this.hasLanguageAccess(userId, languageId))) {
      throw new ForbiddenException('You do not have access to this language');
    }
  }

  async requireVariantAccess(
    userId: string,
    languageId: string,
    variantId: string,
  ): Promise<void> {
    if (!(await this.hasVariantAccess(userId, languageId, variantId))) {
      throw new ForbiddenException('You do not have access to this variant');
    }
  }

  async requireCourseAccess(
    userId: string,
    languageId: string,
    variantId: string | null,
  ): Promise<void> {
    if (!(await this.hasCourseAccess(userId, languageId, variantId))) {
      throw new ForbiddenException(
        'You do not have authorization to contribute to this course',
      );
    }
  }

  async getUserAuthorizations(userId: string) {
    return this.prisma.languageAuthorization.findMany({
      where: {
        userId,
        revokedAt: null,
      },
      include: {
        language: true,
        variant: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }
}
