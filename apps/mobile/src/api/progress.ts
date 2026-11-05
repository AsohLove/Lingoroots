
import { apiFetch } from './client';

export type LessonProgressStatus = 'IN_PROGRESS' | 'COMPLETED';

export type LessonProgressRecord = {
  id: string;
  userId: string;
  lessonId: string;
  status: LessonProgressStatus;
  startedAt: string;
  completedAt: string | null;
  updatedAt: string;
};

export type LessonProgressItem = LessonProgressRecord & {
  lesson: {
    id: string;
    name: string;
    order: number;
    unit: {
      id: string;
      name: string;
      level: {
        id: string;
        code: string;
        name: string;
        course: {
          id: string;
          name: string;
          language: {
            id: string;
            name: string;
          };
        };
      };
    };
  };
};

export type ProgressSummary = {
  totalStarted: number;
  totalCompleted: number;
  totalInProgress: number;
  lessons: LessonProgressItem[];
};

export function startLessonProgress(lessonId: string) {
  return apiFetch<LessonProgressRecord>(
    `/me/progress/lessons/${lessonId}/start`,
    { method: 'POST' },
  );
}

export function getMyProgress() {
  return apiFetch<ProgressSummary>('/me/progress');
}

export function getLessonProgress(lessonId: string) {
  return apiFetch<LessonProgressRecord | null>(
    `/me/progress/lessons/${lessonId}`,
  );
}
