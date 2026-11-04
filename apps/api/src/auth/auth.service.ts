import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '../generated/prisma/client.js';
import { createHmac, randomInt, timingSafeEqual } from 'node:crypto';
import * as argon2 from 'argon2';
import { PrismaService } from '../prisma/prisma.service.js';
import { EmailService } from '../email/email.service.js';

const CODE_EXPIRY_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;
const MAX_VERIFICATION_ATTEMPTS = 5;
const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly config: ConfigService,
  ) {}

  private generateVerificationCode(): string {
    return randomInt(0, 1_000_000).toString().padStart(6, '0');
  }

  private hashVerificationCode(userId: string, code: string): string {
    const secret = this.config.getOrThrow<string>('VERIFICATION_CODE_SECRET');

    return createHmac('sha256', secret)
      .update(`${userId}:${code}`)
      .digest('hex');
  }

  private codesMatch(expectedHash: string, suppliedHash: string): boolean {
    const expected = Buffer.from(expectedHash, 'hex');
    const supplied = Buffer.from(suppliedHash, 'hex');

    return (
      expected.length === supplied.length && timingSafeEqual(expected, supplied)
    );
  }

  async register(name: string, email: string, password: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const passwordHash = await argon2.hash(password);
    const code = this.generateVerificationCode();
    const now = new Date();

    let user: { id: string; email: string };

    try {
      user = await this.prisma.$transaction(async (tx) => {
        const createdUser = await tx.user.create({
          data: {
            name: name.trim(),
            email: normalizedEmail,
            passwordHash,
            roles: {
              create: {
                role: 'LEARNER',
              },
            },
          },
          select: {
            id: true,
            email: true,
          },
        });

        await tx.emailVerification.create({
          data: {
            userId: createdUser.id,
            codeHash: this.hashVerificationCode(createdUser.id, code),
            expiresAt: new Date(now.getTime() + CODE_EXPIRY_MS),
            lastSentAt: now,
          },
        });

        return createdUser;
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        // Do not disclose whether an email is already registered.
        return {
          message:
            'If registration is possible, verification instructions will be sent to that address.',
        };
      }

      throw error;
    }

    void this.emailService
      .sendVerificationCode(user.email, code)
      .catch((error: unknown) => {
        this.logger.warn(
          `Registration completed but verification email delivery failed: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      });

    return {
      message:
        'Account created. Check your email shortly for the verification code.',
      email: user.email,
    };
  }

  async verifyEmail(email: string, code: string) {
    const normalizedEmail = email.trim().toLowerCase();

    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        emailVerifiedAt: true,
        emailVerification: true,
      },
    });

    if (!user || user.emailVerifiedAt || !user.emailVerification) {
      throw new BadRequestException('Invalid or expired verification code.');
    }

    const verification = user.emailVerification;
    const now = new Date();

    if (verification.expiresAt <= now) {
      await this.prisma.emailVerification.deleteMany({
        where: { id: verification.id },
      });

      throw new BadRequestException('Invalid or expired verification code.');
    }

    if (verification.attempts >= MAX_VERIFICATION_ATTEMPTS) {
      throw new BadRequestException(
        'Too many verification attempts. Request a new code.',
      );
    }

    const suppliedHash = this.hashVerificationCode(user.id, code);

    if (!this.codesMatch(verification.codeHash, suppliedHash)) {
      const result = await this.prisma.emailVerification.updateMany({
        where: {
          id: verification.id,
          attempts: { lt: MAX_VERIFICATION_ATTEMPTS },
        },
        data: {
          attempts: { increment: 1 },
        },
      });

      if (result.count === 0) {
        throw new BadRequestException(
          'Too many verification attempts. Request a new code.',
        );
      }

      throw new BadRequestException('Invalid or expired verification code.');
    }

    const session = await this.prisma.$transaction(async (tx) => {
      const claimed = await tx.emailVerification.updateMany({
        where: {
          id: verification.id,
          codeHash: verification.codeHash,
          expiresAt: { gt: now },
          attempts: { lt: MAX_VERIFICATION_ATTEMPTS },
        },
        data: {
          attempts: MAX_VERIFICATION_ATTEMPTS,
        },
      });

      if (claimed.count !== 1) {
        throw new BadRequestException('Invalid or expired verification code.');
      }

      await tx.user.update({
        where: { id: user.id },
        data: {
          emailVerifiedAt: now,
        },
      });

      await tx.emailVerification.deleteMany({
        where: { id: verification.id },
      });

      return tx.session.create({
        data: {
          userId: user.id,
          expiresAt: new Date(now.getTime() + SESSION_DURATION_MS),
        },
      });
    });

    return {
      message: 'Email verified successfully. You are now signed in.',
      sessionId: session.id,
    };
  }

  async resendVerification(email: string) {
    const normalizedEmail = email.trim().toLowerCase();

    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: {
        emailVerification: true,
      },
    });

    const genericResponse = {
      message: 'If the account requires verification, a new code will be sent.',
    };

    if (!user || user.emailVerifiedAt) {
      return genericResponse;
    }

    const now = new Date();
    const previousSentAt = user.emailVerification?.lastSentAt;

    if (
      previousSentAt &&
      now.getTime() - previousSentAt.getTime() < RESEND_COOLDOWN_MS
    ) {
      return genericResponse;
    }

    const code = this.generateVerificationCode();
    const codeHash = this.hashVerificationCode(user.id, code);

    if (!user.emailVerification) {
      // Also supports accounts created before verification was introduced.
      try {
        await this.prisma.emailVerification.create({
          data: {
            userId: user.id,
            codeHash,
            expiresAt: new Date(now.getTime() + CODE_EXPIRY_MS),
            lastSentAt: now,
          },
        });
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2002'
        ) {
          return genericResponse;
        }

        throw error;
      }
    } else {
      // Atomic cooldown check: only one concurrent request can succeed.
      const updated = await this.prisma.emailVerification.updateMany({
        where: {
          userId: user.id,
          lastSentAt: {
            lte: new Date(now.getTime() - RESEND_COOLDOWN_MS),
          },
        },
        data: {
          codeHash,
          expiresAt: new Date(now.getTime() + CODE_EXPIRY_MS),
          attempts: 0,
          lastSentAt: now,
        },
      });

      if (updated.count !== 1) {
        return genericResponse;
      }
    }



    await this.emailService.sendVerificationCode(user.email, code);


    return genericResponse;
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: email.trim().toLowerCase(),
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordMatches = await argon2.verify(user.passwordHash, password);

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.emailVerifiedAt) {
      throw new ForbiddenException(
        'Please verify your email address before logging in.',
      );
    }

    const session = await this.prisma.session.create({
      data: {
        userId: user.id,
        expiresAt: new Date(Date.now() + SESSION_DURATION_MS),
      },
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
      sessionId: session.id,
    };
  }

  async getCurrentUser(sessionId: string) {
    const session = await this.prisma.session.findUnique({
      where: {
        id: sessionId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            emailVerifiedAt: true,
            createdAt: true,
            roles: {
              select: {
                role: true,
              },
            },
          },
        },
      },
    });

    if (!session) {
      throw new UnauthorizedException('Invalid session');
    }

    if (session.expiresAt <= new Date()) {
      throw new UnauthorizedException('Session has expired');
    }

    if (!session.user.emailVerifiedAt) {
      throw new UnauthorizedException('Email verification is required.');
    }

    return {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      createdAt: session.user.createdAt,
      roles: session.user.roles.map((userRole) => userRole.role),
    };
  }

  async logout(sessionId: string) {
    await this.prisma.session.deleteMany({
      where: {
        id: sessionId,
      },
    });
  }
}
