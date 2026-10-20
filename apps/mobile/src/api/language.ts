import { API_BASE_URL } from '../config/api';

export type Language = {
  id: string;
  name: string;
  description: string | null;
};

export async function getLanguages(): Promise<Language[]> {
  const response = await fetch(`${API_BASE_URL}/languages`);

  if (!response.ok) {
    throw new Error('Failed to load languages');
  }

  return response.json();
}