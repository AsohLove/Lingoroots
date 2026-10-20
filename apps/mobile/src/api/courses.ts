import { API_BASE_URL } from '../config/api';

export type Course = {
  id: string;
  languageId: string;
  name: string;
  description: string | null;
};

export async function getCoursesByLanguage(
  languageId: string,
): Promise<Course[]> {
  const response = await fetch(
    `${API_BASE_URL}/languages/${languageId}/courses`,
  );

  if (!response.ok) {
    throw new Error('Failed to load courses');
  }

  return response.json();
}