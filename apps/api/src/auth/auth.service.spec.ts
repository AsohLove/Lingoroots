import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as argon2 from 'argon2';
import { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuthService } from './auth.service.js';

describe('AuthService', () => {
  let service: AuthService;

  const prismaMock = {
    user: {
      create: vi.fn(),
      findUnique: vi.fn(),
    },
    session: {
      create: vi.fn(),
      findUnique: vi.fn(),
      deleteMany: vi.fn(),
    },
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should create a user with a hashed password', async () => {
      prismaMock.user.create.mockImplementation(({ data }) => ({
        id: 'user-1',
        email: data.email,
        createdAt: new Date('2026-10-28T09:00:00Z'),
      }));

      const result = await service.register(
        'learner@example.com',
        'password123',
      );

      expect(prismaMock.user.create).toHaveBeenCalledOnce();

      const createCall =
        prismaMock.user.create.mock.calls[0][0];

      expect(createCall.data.email).toBe(
        'learner@example.com',
      );

      expect(createCall.data.passwordHash).not.toBe(
        'password123',
      );

      const passwordMatches = await argon2.verify(
        createCall.data.passwordHash,
        'password123',
      );

      expect(passwordMatches).toBe(true);

      expect(result.email).toBe('learner@example.com');
    });

    it('should throw ConflictException for a duplicate email', async () => {
      const prismaError =
        new Prisma.PrismaClientKnownRequestError(
          'Unique constraint failed',
          {
            code: 'P2002',
            clientVersion: '7.10.0',
          },
        );

      prismaMock.user.create.mockRejectedValue(prismaError);

      await expect(
        service.register(
          'learner@example.com',
          'password123',
        ),
      ).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('login', () => {
    const user = {
      id: 'user-1',
      email: 'learner@example.com',
      passwordHash: '',
      createdAt: new Date('2026-10-28T09:00:00Z'),
    };

    it('should create a session for valid credentials', async () => {
      const passwordHash = await argon2.hash(
        'password123',
      );

      prismaMock.user.findUnique.mockResolvedValue({
        ...user,
        passwordHash,
      });

      prismaMock.session.create.mockResolvedValue({
        id: 'session-1',
        userId: 'user-1',
        expiresAt: new Date(
          Date.now() + 1000 * 60 * 60 * 24 * 30,
        ),
        createdAt: new Date(),
      });

      const result = await service.login(
        'learner@example.com',
        'password123',
      );

      expect(
        prismaMock.session.create,
      ).toHaveBeenCalledOnce();

      expect(result.sessionId).toBe('session-1');
      expect(result.user.email).toBe(
        'learner@example.com',
      );
    });

    it('should reject an unknown email', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login(
          'missing@example.com',
          'password123',
        ),
      ).rejects.toBeInstanceOf(UnauthorizedException);

      expect(
        prismaMock.session.create,
      ).not.toHaveBeenCalled();
    });

    it('should reject an incorrect password', async () => {
      const passwordHash = await argon2.hash(
        'password123',
      );

      prismaMock.user.findUnique.mockResolvedValue({
        ...user,
        passwordHash,
      });

      await expect(
        service.login(
          'learner@example.com',
          'wrongpassword',
        ),
      ).rejects.toBeInstanceOf(UnauthorizedException);

      expect(
        prismaMock.session.create,
      ).not.toHaveBeenCalled();
    });
  });

  describe('getCurrentUser', () => {
    it('should return the user for a valid session', async () => {
      prismaMock.session.findUnique.mockResolvedValue({
        id: 'session-1',
        userId: 'user-1',
        expiresAt: new Date(Date.now() + 60_000),
        createdAt: new Date(),
        user: {
          id: 'user-1',
          email: 'learner@example.com',
          createdAt: new Date(),
        },
      });

      const result =
        await service.getCurrentUser('session-1');

      expect(result.email).toBe(
        'learner@example.com',
      );
    });

    it('should reject a missing session', async () => {
      prismaMock.session.findUnique.mockResolvedValue(
        null,
      );

      await expect(
        service.getCurrentUser('missing-session'),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('should reject an expired session', async () => {
      prismaMock.session.findUnique.mockResolvedValue({
        id: 'session-1',
        userId: 'user-1',
        expiresAt: new Date(Date.now() - 60_000),
        createdAt: new Date(),
        user: {
          id: 'user-1',
          email: 'learner@example.com',
          createdAt: new Date(),
        },
      });

      await expect(
        service.getCurrentUser('session-1'),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('should delete the session', async () => {
      prismaMock.session.deleteMany.mockResolvedValue({
        count: 1,
      });

      await service.logout('session-1');

      expect(
        prismaMock.session.deleteMany,
      ).toHaveBeenCalledWith({
        where: {
          id: 'session-1',
        },
      });
    });
  });
});