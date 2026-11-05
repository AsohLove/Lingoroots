import {
  BadRequestException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { createHmac } from 'node:crypto';
import * as argon2 from 'argon2';

import { PrismaService } from '../prisma/prisma.service.js';
import { EmailService } from '../email/email.service.js';
import { AuthService } from './auth.service.js';

describe('AuthService', () => {
  let service: AuthService;

  const secret = 'test-verification-secret';

  const txMock = {
    user: {
      create: vi.fn(),
      update: vi.fn(),
    },
    emailVerification: {
      create: vi.fn(),
      updateMany: vi.fn(),
      deleteMany: vi.fn(),
    },
  };

  const prismaMock = {
    $transaction: vi.fn(),
    user: {
      create: vi.fn(),
      findUnique: vi.fn(),
    },
    session: {
      create: vi.fn(),
      findUnique: vi.fn(),
      deleteMany: vi.fn(),
    },
    emailVerification: {
      findUnique: vi.fn(),
      updateMany: vi.fn(),
      deleteMany: vi.fn(),
      upsert: vi.fn(),
    },
  };

  const emailMock = {
    sendVerificationCode: vi.fn(),
  };

  const configMock = {
    getOrThrow: vi.fn().mockReturnValue(secret),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    prismaMock.$transaction.mockImplementation(
      async (callback) => callback(txMock),
    );

    const module: TestingModule =
      await Test.createTestingModule({
        providers: [
          AuthService,
          {
            provide: PrismaService,
            useValue: prismaMock,
          },
          {
            provide: EmailService,
            useValue: emailMock,
          },
          {
            provide: ConfigService,
            useValue: configMock,
          },
        ],
      }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('does not wait for verification email delivery before responding', async () => {
      txMock.user.create.mockResolvedValue({
        id: 'user-1',
        email: 'learner@example.com',
      });
      txMock.emailVerification.create.mockResolvedValue({});

      let finishEmailDelivery!: () => void;
      emailMock.sendVerificationCode.mockReturnValue(
        new Promise<void>((resolve) => {
          finishEmailDelivery = resolve;
        }),
      );

      const result = await service.register(
        'Love Asoh',
        'learner@example.com',
        'password123',
      );

      expect(result.email).toBe('learner@example.com');
      expect(emailMock.sendVerificationCode).toHaveBeenCalledOnce();
      finishEmailDelivery();
    });

    it('creates an unverified learner and sends a code', async () => {
      txMock.user.create.mockResolvedValue({
        id: 'user-1',
        email: 'learner@example.com',
      });

      txMock.emailVerification.create.mockResolvedValue({});

      emailMock.sendVerificationCode.mockResolvedValue(
        undefined,
      );

      const result = await service.register(
        'Love Asoh',
        'learner@example.com',
        'password123',
      );

      expect(txMock.user.create).toHaveBeenCalledOnce();
      expect(txMock.emailVerification.create).toHaveBeenCalledOnce();
      expect(emailMock.sendVerificationCode).toHaveBeenCalledOnce();

      const createCall =
        txMock.user.create.mock.calls[0][0];

      expect(createCall.data.email).toBe(
        'learner@example.com',
      );

      expect(createCall.data.roles).toEqual({
        create: { role: 'LEARNER' },
      });

      expect(
        await argon2.verify(
          createCall.data.passwordHash,
          'password123',
        ),
      ).toBe(true);

      const verificationCall =
        txMock.emailVerification.create.mock.calls[0][0];

      expect(verificationCall.data.codeHash).not.toMatch(
        /^\d{6}$/,
      );

      expect(result.email).toBe('learner@example.com');
    });

    it('does not create a session during registration', async () => {
      txMock.user.create.mockResolvedValue({
        id: 'user-1',
        email: 'learner@example.com',
      });

      txMock.emailVerification.create.mockResolvedValue(
        {},
      );

      emailMock.sendVerificationCode.mockResolvedValue(
        undefined,
      );

      await service.register(
        'Love Asoh',
        'learner@example.com',
        'password123',
      );

      expect(prismaMock.session.create).not.toHaveBeenCalled();
    });
  });

  describe('verifyEmail', () => {
    it('verifies an email using a valid code', async () => {
      const code = '123456';
      const userId = 'user-1';

      const codeHash = createHmac('sha256', secret)
        .update(`${userId}:${code}`)
        .digest('hex');

      prismaMock.user.findUnique.mockResolvedValue({
        id: userId,
        emailVerifiedAt: null,
        emailVerification: {
          id: 'verification-1',
          codeHash,
          expiresAt: new Date(Date.now() + 600_000),
          attempts: 0,
        },
      });

      txMock.emailVerification.updateMany.mockResolvedValue({
        count: 1,
      });

      txMock.user.update.mockResolvedValue({});
      txMock.emailVerification.deleteMany.mockResolvedValue({
        count: 1,
      });

      const result = await service.verifyEmail(
        'learner@example.com',
        code,
      );

      expect(txMock.user.update).toHaveBeenCalledOnce();
      expect(
        txMock.emailVerification.deleteMany,
      ).toHaveBeenCalledOnce();

      expect(result.message).toContain('verified');
    });

    it('rejects an incorrect code', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user-1',
        emailVerifiedAt: null,
        emailVerification: {
          id: 'verification-1',
          codeHash: 'a'.repeat(64),
          expiresAt: new Date(Date.now() + 600_000),
          attempts: 0,
        },
      });

      prismaMock.emailVerification.updateMany.mockResolvedValue({
        count: 1,
      });

      await expect(
        service.verifyEmail(
          'learner@example.com',
          '000000',
        ),
      ).rejects.toBeInstanceOf(BadRequestException);

      expect(
        prismaMock.emailVerification.updateMany,
      ).toHaveBeenCalledOnce();

      expect(txMock.user.update).not.toHaveBeenCalled();
    });

    it('rejects an expired code', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user-1',
        emailVerifiedAt: null,
        emailVerification: {
          id: 'verification-1',
          codeHash: 'a'.repeat(64),
          expiresAt: new Date(Date.now() - 60_000),
          attempts: 0,
        },
      });

      prismaMock.emailVerification.deleteMany.mockResolvedValue({
        count: 1,
      });

      await expect(
        service.verifyEmail(
          'learner@example.com',
          '123456',
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('login', () => {
    const passwordHashPromise = argon2.hash('password123');

    it('creates a session for a verified user', async () => {
      const passwordHash = await passwordHashPromise;

      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user-1',
        name: 'Love Asoh',
        email: 'learner@example.com',
        passwordHash,
        emailVerifiedAt: new Date(),
        createdAt: new Date(),
      });

      prismaMock.session.create.mockResolvedValue({
        id: 'session-1',
      });

      const result = await service.login(
        'learner@example.com',
        'password123',
      );

      expect(prismaMock.session.create).toHaveBeenCalledOnce();
      expect(result.sessionId).toBe('session-1');
    });

    it('rejects an unverified user without creating a session', async () => {
      const passwordHash = await passwordHashPromise;

      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user-1',
        name: 'Love Asoh',
        email: 'learner@example.com',
        passwordHash,
        emailVerifiedAt: null,
        createdAt: new Date(),
      });

      await expect(
        service.login(
          'learner@example.com',
          'password123',
        ),
      ).rejects.toBeInstanceOf(ForbiddenException);

      expect(prismaMock.session.create).not.toHaveBeenCalled();
    });

    it('rejects an unknown email', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login(
          'missing@example.com',
          'password123',
        ),
      ).rejects.toBeInstanceOf(UnauthorizedException);

      expect(prismaMock.session.create).not.toHaveBeenCalled();
    });
  });

  describe('getCurrentUser', () => {
    it('returns a user for a valid verified session', async () => {
      prismaMock.session.findUnique.mockResolvedValue({
        id: 'session-1',
        expiresAt: new Date(Date.now() + 60_000),
        user: {
          id: 'user-1',
          name: 'Love Asoh',
          email: 'learner@example.com',
          emailVerifiedAt: new Date(),
          createdAt: new Date(),
          roles: [{ role: 'LEARNER' }],
        },
      });

      const result =
        await service.getCurrentUser('session-1');

      expect(result.email).toBe('learner@example.com');
      expect(result.roles).toEqual(['LEARNER']);
    });

    it('rejects an unverified user session', async () => {
      prismaMock.session.findUnique.mockResolvedValue({
        id: 'session-1',
        expiresAt: new Date(Date.now() + 60_000),
        user: {
          id: 'user-1',
          name: 'Love Asoh',
          email: 'learner@example.com',
          emailVerifiedAt: null,
          createdAt: new Date(),
          roles: [{ role: 'LEARNER' }],
        },
      });

      await expect(
        service.getCurrentUser('session-1'),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('rejects a missing session', async () => {
      prismaMock.session.findUnique.mockResolvedValue(null);

      await expect(
        service.getCurrentUser('missing-session'),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('rejects an expired session', async () => {
      prismaMock.session.findUnique.mockResolvedValue({
        id: 'session-1',
        expiresAt: new Date(Date.now() - 60_000),
        user: {
          id: 'user-1',
          name: 'Love Asoh',
          email: 'learner@example.com',
          emailVerifiedAt: new Date(),
          createdAt: new Date(),
          roles: [{ role: 'LEARNER' }],
        },
      });

      await expect(
        service.getCurrentUser('session-1'),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('deletes the session', async () => {
      prismaMock.session.deleteMany.mockResolvedValue({
        count: 1,
      });

      await service.logout('session-1');

      expect(prismaMock.session.deleteMany).toHaveBeenCalledWith({
        where: { id: 'session-1' },
      });
    });
  });
});