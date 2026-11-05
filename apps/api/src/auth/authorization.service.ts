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
        OR: [
          {
            variantId: null,
          },
          {
            variantId,
          },
        ],
      },
    });

    return authorization !== null;
  }

  requireRole(user: AuthenticatedUser, role: Role): void {
    if (!this.hasRole(user, role)) {
      throw new ForbiddenException('You do not have the required role');
    }
  }

  async requireLanguageAccess(
    userId: string,
    languageId: string,
  ): Promise<void> {
    const hasAccess = await this.hasLanguageAccess(userId, languageId);

    if (!hasAccess) {
      throw new ForbiddenException('You do not have access to this language');
    }
  }

  async requireVariantAccess(
    userId: string,
    languageId: string,
    variantId: string,
  ): Promise<void> {
    const hasAccess = await this.hasVariantAccess(
      userId,
      languageId,
      variantId,
    );

    if (!hasAccess) {
      throw new ForbiddenException('You do not have access to this variant');
    }
  }

  async getUserAuthorizations(userId: string) {
    return this.prisma.languageAuthorization.findMany({
      where: {
        userId,
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
