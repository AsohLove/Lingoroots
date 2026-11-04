
import { apiFetch } from './client';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  roles?: string[];
};

export type AuthResponse = {
  user: AuthUser;
  sessionToken?: string;
  message?: string;
};

export function register(
  name: string,
  email: string,
  password: string,
): Promise<{ message: string; email?: string }> {
  return apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
}

export function verifyEmail(
  email: string,
  code: string,
): Promise<AuthResponse> {
  return apiFetch('/auth/verify-email', {
    method: 'POST',
    headers: { 'X-Client-Type': 'mobile' },
    body: JSON.stringify({ email, code }),
  });
}

export function resendVerification(
  email: string,
): Promise<{ message: string }> {
  return apiFetch('/auth/resend-verification', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export function login(
  email: string,
  password: string,
): Promise<AuthResponse> {
  return apiFetch('/auth/login', {
    method: 'POST',
    headers: { 'X-Client-Type': 'mobile' },
    body: JSON.stringify({ email, password }),
  });
}

export function getCurrentUser(): Promise<AuthUser> {
  return apiFetch('/auth/me');
}

export function logout(): Promise<{ message: string }> {
  return apiFetch('/auth/logout', { method: 'POST' });
}
