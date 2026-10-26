import { API_BASE_URL } from '../config/api';

export type Level = {
  id: string;
  courseId: string;
  code: string;
  name: string;
  description: string | null;
  order: number;
};

export type Course = {
  id: string;
  languageId: string;
  name: string;
  description: string | null;
  levels: Level[];
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