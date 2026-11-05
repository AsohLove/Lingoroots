import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard.js';

describe('RolesGuard', () => {
  const reflector = {
    getAllAndOverride: vi.fn(),
  };

  const guard = new RolesGuard(reflector as unknown as Reflector);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  function createContext(user?: {
    id: string;
    name: string;
    email: string;
    createdAt: Date;
    roles: string[];
  }) {
    const request = {
      user,
    };

    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
      getHandler: vi.fn(),
      getClass: vi.fn(),
    } as unknown as ExecutionContext;
  }

  it('should allow access when no roles are required', () => {
    reflector.getAllAndOverride.mockReturnValue([]);

    const context = createContext();

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow access when the user has a required role', () => {
    reflector.getAllAndOverride.mockReturnValue(['LEARNER']);

    const context = createContext({
      id: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
      createdAt: new Date(),
      roles: ['LEARNER'],
    });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should reject access when the user lacks the required role', () => {
    reflector.getAllAndOverride.mockReturnValue(['REVIEWER']);

    const context = createContext({
      id: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
      createdAt: new Date(),
      roles: ['LEARNER'],
    });

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('should reject access when no authenticated user exists', () => {
    reflector.getAllAndOverride.mockReturnValue(['LEARNER']);

    const context = createContext();

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });
});
