import { api } from './api';
import type { LanguageAuthorization } from '../types/authorization';

export async function getMyAuthorizations(): Promise<
  LanguageAuthorization[]
> {
  return api<LanguageAuthorization[]>('/auth/me/authorizations');
}