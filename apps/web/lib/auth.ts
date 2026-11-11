import { api } from './api';
import type {
  AuthenticatedUser,
  LoginResponse,
} from '../types/auth';


export type RegistrationResponse = {
  message: string;
  email?: string;
};

export type VerificationResponse = {
  message: string;
  user: AuthenticatedUser;
};

export async function register(
  name: string,
  email: string,
  password: string,
): Promise<RegistrationResponse> {
  return api<RegistrationResponse>('/auth/register', {
    method: 'POST',
    body: { name, email, password },
  });
}

export async function verifyEmail(
  email: string,
  code: string,
): Promise<VerificationResponse> {
  return api<VerificationResponse>('/auth/verify-email', {
    method: 'POST',
    body: { email, code },
  });
}

export async function resendVerification(
  email: string,
): Promise<{ message: string }> {
  return api<{ message: string }>('/auth/resend-verification', {
    method: 'POST',
    body: { email },
  });
}


export async function login(
  email: string,
  password: string,
): Promise<LoginResponse> {
  return api<LoginResponse>('/auth/login', {
    method: 'POST',
    body: {
      email,
      password,
    },
  });
}

export async function getCurrentUser(): Promise<AuthenticatedUser> {
  return api<AuthenticatedUser>('/auth/me');
}

export async function logout(): Promise<void> {
  await api('/auth/logout', {
    method: 'POST',
  });
}