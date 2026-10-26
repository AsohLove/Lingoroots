import { API_BASE_URL } from "../config/api";

export type Lesson = {
  id: string;
  unitId: string;
  name: string;
  description: string | null;
  order: number;
};

export async function getLessonsByUnit(unitId: string): Promise<Lesson[]> {
  const response = await fetch(
    `${API_BASE_URL}/units/${unitId}/lessons`,
  );

  if (!response.ok) {
    throw new Error("Failed to load lessons");
  }

  return response.json();
}