import { API_BASE_URL } from "../config/api";

export type VocabularyItem = {
  id: string;
  lessonId: string;
  term: string;
  meaning: string;
  explanation: string | null;
  order: number;
};

export type Expression = {
  id: string;
  lessonId: string;
  text: string;
  translation: string;
  explanation: string | null;
  order: number;
};

export type ExampleSentence = {
  id: string;
  lessonId: string;
  text: string;
  translation: string;
  explanation: string | null;
  order: number;
};

export type LessonContent = {
  id: string;
  unitId: string;
  name: string;
  description: string | null;
  order: number;
  vocabularyItems: VocabularyItem[];
  expressions: Expression[];
  exampleSentences: ExampleSentence[];
};

export async function getLessonContent(
  unitId: string,
  lessonId: string,
): Promise<LessonContent> {
  const response = await fetch(
    `${API_BASE_URL}/units/${unitId}/lessons/${lessonId}/content`,
  );

  if (!response.ok) {
    throw new Error("Failed to load lesson content");
  }

  return response.json();
}