
import { apiFetch } from './client';

export type Language = {
  id: string;
  name: string;
  description: string | null;
};

export function getLanguages(): Promise<Language[]> {
  return apiFetch('/languages');
}
