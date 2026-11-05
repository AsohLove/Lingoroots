import { api } from './api';
import type {
  AuthenticatedUser,
  LoginResponse,
} from '../types/auth';

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