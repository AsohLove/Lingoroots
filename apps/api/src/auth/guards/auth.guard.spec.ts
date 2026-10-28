import {
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from './auth.guard.js';

describe('AuthGuard', () => {
  const authServiceMock = {
    getCurrentUser: vi.fn(),
  };

  const guard = new AuthGuard(
    authServiceMock as any,
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  function createContext(cookies: Record<string, string> = {}) {
    const request = {
      cookies,
    };

    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
      request,
    } as any;
  }

  it('should reject a request without a session cookie', async () => {
    const context = createContext();

    await expect(
      guard.canActivate(context),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect(
      authServiceMock.getCurrentUser,
    ).not.toHaveBeenCalled();
  });

  it('should authenticate a request with a valid session', async () => {
    const user = {
      id: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
      createdAt: new Date(),
      roles: ['LEARNER'],
    };

    authServiceMock.getCurrentUser.mockResolvedValue(user);

    const context = createContext({
      session_id: 'session-123',
    });

    await expect(
      guard.canActivate(context),
    ).resolves.toBe(true);

    expect(
      authServiceMock.getCurrentUser,
    ).toHaveBeenCalledWith('session-123');

    expect(context.request.user).toEqual(user);
  });
});