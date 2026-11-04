import { api } from './api';

export type ExerciseType = 'MULTIPLE_CHOICE' | 'TEXT_INPUT';

export type ExerciseOption = {
  id: string;
  text: string;
  order: number;
  isCorrect?: boolean;
};

export type ExerciseAnswer = {
  id: string;
  value: string;
};

export type Exercise = {
  id: string;
  lessonId: string;
  type: ExerciseType;
  prompt: string;
  explanation: string | null;
  order: number;
  status: string;
  version?: number;
  options: ExerciseOption[];
  acceptedAnswers?: ExerciseAnswer[];
  lesson?: { id: string; name: string };
  createdBy?: { id: string; name: string };
};

export type CreateExerciseInput = {
  type: ExerciseType;
  prompt: string;
  explanation?: string;
  order: number;
  options?: {
    text: string;
    order: number;
    isCorrect: boolean;
  }[];
  acceptedAnswers?: string[];
};

export type ExerciseReviewDecision = {
  comment?: string;
};

export function createExercise(
  lessonId: string,
  input: CreateExerciseInput,
) {
  return api<Exercise>(`/lessons/${lessonId}/exercises`, {
    method: 'POST',
    body: input,
  });
}

export function submitExercise(exerciseId: string) {
  return api<Exercise>(`/exercises/${exerciseId}/submit`, {
    method: 'POST',
  });
}

export function getExerciseReviewQueue() {
  return api<Exercise[]>('/content-review/exercises');
}

export function startExerciseReview(exerciseId: string) {
  return api<Exercise>(
    `/content-review/exercises/${exerciseId}/start`,
    { method: 'POST' },
  );
}

export function approveExercise(
  exerciseId: string,
  comment?: string,
) {
  return api<Exercise>(
    `/content-review/exercises/${exerciseId}/approve`,
    { method: 'POST', body: { comment } },
  );
}

export function requestExerciseChanges(
  exerciseId: string,
  comment: string,
) {
  return api<Exercise>(
    `/content-review/exercises/${exerciseId}/request-changes`,
    { method: 'POST', body: { comment } },
  );
}

export function rejectExercise(
  exerciseId: string,
  comment: string,
) {
  return api<Exercise>(
    `/content-review/exercises/${exerciseId}/reject`,
    { method: 'POST', body: { comment } },
  );
}