
import { apiFetch } from './client';

export type Unit = {
  id: string;
  levelId: string;
  name: string;
  description: string | null;
  order: number;
};

export function getUnitsByLevel(levelId: string): Promise<Unit[]> {
  return apiFetch(`/levels/${levelId}/units`);
}
