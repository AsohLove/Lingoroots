
import { apiFetch } from './client';

export type ExerciseType = 'MULTIPLE_CHOICE' | 'TEXT_INPUT';

export type ExerciseOption = {
  id: string;
  text: string;
  order: number;
};

export type Exercise = {
  id: string;
  lessonId: string;
  type: ExerciseType;
  prompt: string;
  explanation: string | null;
  order: number;
  version: number;
  options: ExerciseOption[];
};

export type ExerciseAttemptResult = {
  attemptId: string;
  isCorrect: boolean;
  explanation: string | null;
  submittedAt: string;
};

export function getExercises(lessonId: string) {
  return apiFetch<Exercise[]>(
    `/lessons/${lessonId}/exercises`,
  );
}

export function submitExerciseAnswer(
  exerciseId: string,
  answer:
    | { selectedOptionId: string }
    | { submittedText: string },
) {
  return apiFetch<ExerciseAttemptResult>(
    `/exercises/${exerciseId}/attempts`,
    {
      method: 'POST',
      body: JSON.stringify(answer),
    },
  );
}
