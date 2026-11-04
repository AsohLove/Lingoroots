
import { apiFetch } from './client';

export type Lesson = {
  id: string;
  unitId: string;
  name: string;
  description: string | null;
  order: number;
};

export function getLessonsByUnit(unitId: string): Promise<Lesson[]> {
  return apiFetch(`/units/${unitId}/lessons`);
}
