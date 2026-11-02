import { api } from './api';

export type ReviewVocabularyItem = {
  id: string;
  lessonId: string;
  createdById: string;
  term: string;
  meaning: string;
  explanation: string | null;
  order: number;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export async function getSubmittedVocabulary(): Promise<
  ReviewVocabularyItem[]
> {
  return api<ReviewVocabularyItem[]>(
    '/reviews/vocabulary',
  );
}

export async function startVocabularyReview(
  vocabularyId: string,
): Promise<ReviewVocabularyItem> {
  return api<ReviewVocabularyItem>(
    `/vocabulary/${vocabularyId}/review/start`,
    {
      method: 'POST',
    },
  );
}

export async function approveVocabulary(
  vocabularyId: string,
  comment?: string,
): Promise<ReviewVocabularyItem> {
  return api<ReviewVocabularyItem>(
    `/vocabulary/${vocabularyId}/review/approve`,
    {
      method: 'POST',
      body: {
        comment,
      },
    },
  );
}

export async function requestVocabularyChanges(
  vocabularyId: string,
  comment: string,
): Promise<ReviewVocabularyItem> {
  return api<ReviewVocabularyItem>(
    `/vocabulary/${vocabularyId}/review/request-changes`,
    {
      method: 'POST',
      body: {
        comment,
      },
    },
  );
}

export async function rejectVocabulary(
  vocabularyId: string,
  comment: string,
): Promise<ReviewVocabularyItem> {
  return api<ReviewVocabularyItem>(
    `/vocabulary/${vocabularyId}/review/reject`,
    {
      method: 'POST',
      body: {
        comment,
      },
    },
  );
}