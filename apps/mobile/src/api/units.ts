import { API_BASE_URL } from "../config/api";

export type Unit = {
  id: string;
  levelId: string;
  name: string;
  description: string | null;
  order: number;
};

export async function getUnitsByLevel(levelId: string): Promise<Unit[]> {
  const response = await fetch(
    `${API_BASE_URL}/levels/${levelId}/units`,
  );

  if (!response.ok) {
    throw new Error("Failed to load units");
  }

  return response.json();
}