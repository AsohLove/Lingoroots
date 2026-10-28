import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as argon2 from 'argon2';
import { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async register(name: string, email: string, password: string) {
    const passwordHash = await argon2.hash(password);

    try {
      return await this.prisma.user.create({
        data: {
          name,
          email,
          passwordHash,
          roles: {
            create: {
              role: 'LEARNER',
            },
          },
        },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Email is already registered');
      }

      throw error;
    }
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordMatches = await argon2.verify(user.passwordHash, password);

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const session = await this.prisma.session.create({
      data: {
        userId: user.id,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
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
