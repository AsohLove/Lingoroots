
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

type Lesson = Omit<
  LessonContent,
  "vocabularyItems" | "expressions" | "exampleSentences"
>;

async function fetchApi<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`);

  if (!response.ok) {
    throw new Error(
      `Request failed (${response.status}): ${endpoint}`,
    );
  }

  return response.json() as Promise<T>;
}

export async function getLessonContent(
  unitId: string,
  lessonId: string,
): Promise<LessonContent> {
  // Fetch the lesson details and its published vocabulary.
  const [lessons, vocabularyItems] = await Promise.all([
    fetchApi<Lesson[]>(`/units/${unitId}/lessons`),
    fetchApi<VocabularyItem[]>(
      `/lessons/${lessonId}/vocabulary`,
    ),
  ]);

  const lesson = lessons.find((item) => item.id === lessonId);

  if (!lesson) {
    throw new Error("Lesson not found in this unit");
  }

  return {
    ...lesson,
    vocabularyItems: vocabularyItems.sort(
      (a, b) => a.order - b.order,
    ),
    expressions: [],
    exampleSentences: [],
  };
}
