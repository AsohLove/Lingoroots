
import { apiFetch } from './client';

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

export function getCoursesByLanguage(
  languageId: string,
): Promise<Course[]> {
  return apiFetch(`/languages/${languageId}/courses`);
}

export function getLevelsByCourse(
  courseId: string,
): Promise<Level[]> {
  return apiFetch(`/courses/${courseId}/levels`);
}
