import { apiFetch } from './client';

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

export type LessonAudio = {
  id: string;
  lessonId: string;
  title: string;
  url: string;
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
  audio: LessonAudio[];
};

export async function getLessonContent(
  unitId: string,
  lessonId: string,
): Promise<LessonContent> {
  return apiFetch<LessonContent>(
    `/units/${unitId}/lessons/${lessonId}/content`,
  );
}