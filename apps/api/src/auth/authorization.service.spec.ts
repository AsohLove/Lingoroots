import { ForbiddenException } from '@nestjs/common';
import type { AuthenticatedUser } from './types/authenticated-user.js';
import { AuthorizationService } from './authorization.service.js';

describe('AuthorizationService', () => {
  const prismaMock = {
    languageAuthorization: {
      findFirst: vi.fn(),
    },
  };

  const service = new AuthorizationService(prismaMock as any);

  const learner: AuthenticatedUser = {
    id: 'user-1',
    name: 'Test User',
    email: 'test@example.com',
    createdAt: new Date(),
    roles: ['LEARNER'],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('hasRole', () => {
    it('should return true when the user has the role', () => {
      expect(service.hasRole(learner, 'LEARNER')).toBe(true);
    });

    it('should return false when the user does not have the role', () => {
      expect(service.hasRole(learner, 'CONTRIBUTOR')).toBe(false);
    });
  });

  describe('hasLanguageAccess', () => {
    it('should return true when the user has language-level access', async () => {
      prismaMock.languageAuthorization.findFirst.mockResolvedValue({
        id: 'auth-1',
      });

      await expect(
        service.hasLanguageAccess('user-1', 'language-1'),
      ).resolves.toBe(true);
    });

    it('should return false when the user has no language-level access', async () => {
      prismaMock.languageAuthorization.findFirst.mockResolvedValue(null);

      await expect(
        service.hasLanguageAccess('user-1', 'language-1'),
      ).resolves.toBe(false);
    });
  });

  describe('hasVariantAccess', () => {
    it('should return true when the user has access to the specific variant', async () => {
      prismaMock.languageAuthorization.findFirst.mockResolvedValue({
        id: 'auth-1',
      });

      await expect(
        service.hasVariantAccess('user-1', 'language-1', 'variant-1'),
      ).resolves.toBe(true);
    });

    it('should return false when the user has no access', async () => {
      prismaMock.languageAuthorization.findFirst.mockResolvedValue(null);

      await expect(
        service.hasVariantAccess('user-1', 'language-1', 'variant-1'),
      ).resolves.toBe(false);
    });
  });

  describe('requireRole', () => {
    it('should allow a user with the required role', () => {
      expect(() => service.requireRole(learner, 'LEARNER')).not.toThrow();
    });

    it('should throw ForbiddenException without the required role', () => {
      expect(() => service.requireRole(learner, 'CONTRIBUTOR')).toThrow(
        ForbiddenException,
      );
    });
  });

  describe('requireLanguageAccess', () => {
    it('should allow language access', async () => {
      prismaMock.languageAuthorization.findFirst.mockResolvedValue({
        id: 'auth-1',
      });

      await expect(
        service.requireLanguageAccess('user-1', 'language-1'),
      ).resolves.toBeUndefined();
    });

    it('should throw ForbiddenException without language access', async () => {
      prismaMock.languageAuthorization.findFirst.mockResolvedValue(null);

      await expect(
        service.requireLanguageAccess('user-1', 'language-1'),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });
  });

  describe('requireVariantAccess', () => {
    it('should allow variant access', async () => {
      prismaMock.languageAuthorization.findFirst.mockResolvedValue({
        id: 'auth-1',
      });

      await expect(
        service.requireVariantAccess('user-1', 'language-1', 'variant-1'),
      ).resolves.toBeUndefined();
    });

    it('should throw ForbiddenException without variant access', async () => {
      prismaMock.languageAuthorization.findFirst.mockResolvedValue(null);

      await expect(
        service.requireVariantAccess('user-1', 'language-1', 'variant-1'),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });
  });
});
