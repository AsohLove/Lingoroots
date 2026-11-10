
'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';

import { api } from '../../lib/api';

type VocabularyFormProps = {
  lessonId: string;
};

type VocabularyItem = {
  id: string;
  term: string;
  meaning: string;
  explanation: string | null;
  status: string;
};

export function VocabularyForm({ lessonId }: VocabularyFormProps) {
  const [term, setTerm] = useState('');
  const [translation, setTranslation] = useState('');
  const [notes, setNotes] = useState('');

  const [vocabulary, setVocabulary] =
    useState<VocabularyItem | null>(null);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const canEdit =
    !vocabulary ||
    vocabulary.status === 'DRAFT' ||
    vocabulary.status === 'CHANGES_REQUESTED';

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canEdit) return;

    setMessage('');
    setError('');
    setSaving(true);

    try {
      const result = await api<VocabularyItem>(
        vocabulary
          ? `/vocabulary/${vocabulary.id}`
          : `/lessons/${lessonId}/vocabulary`,
        {
          method: vocabulary ? 'PATCH' : 'POST',
          body: {
            term,
            meaning: translation,
            explanation: notes || undefined,
          },
        },
      );

      setVocabulary(result);
      setMessage(
        vocabulary
          ? 'Vocabulary changes saved.'
          : 'Vocabulary saved successfully as a draft.',
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to save vocabulary.',
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmitForReview() {
    if (
      !vocabulary ||
      (vocabulary.status !== 'DRAFT' &&
        vocabulary.status !== 'CHANGES_REQUESTED')
    ) {
      return;
    }

    setMessage('');
    setError('');
    setSubmitting(true);

    try {
      const result = await api<VocabularyItem>(
        `/vocabulary/${vocabulary.id}/submit`,
        { method: 'POST' },
      );

      setVocabulary(result);
      setMessage('Vocabulary submitted for review.');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to submit vocabulary.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  const canSubmit =
    vocabulary?.status === 'DRAFT' ||
    vocabulary?.status === 'CHANGES_REQUESTED';

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-900">
          Add Vocabulary
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Create vocabulary content for the selected lesson.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        <div>
          <label
            htmlFor="term"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Term
          </label>

          <input
            id="term"
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            required
            disabled={!canEdit}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none disabled:bg-slate-100 focus:border-slate-500"
            placeholder="Enter the vocabulary term"
          />
        </div>

        <div>
          <label
            htmlFor="translation"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Meaning
          </label>

          <input
            id="translation"
            value={translation}
            onChange={(event) => setTranslation(event.target.value)}
            required
            disabled={!canEdit}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none disabled:bg-slate-100 focus:border-slate-500"
            placeholder="Enter the meaning"
          />
        </div>

        <div>
          <label
            htmlFor="notes"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Explanation
          </label>

          <textarea
            id="notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={4}
            disabled={!canEdit}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none disabled:bg-slate-100 focus:border-slate-500"
            placeholder="Optional explanation or usage note"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {canEdit && (
            <button
              type="submit"
              disabled={saving || submitting}
              className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? 'Saving...'
                : vocabulary
                  ? 'Save Changes'
                  : 'Save Draft'}
            </button>
          )}

          {canSubmit && (
            <button
              type="button"
              onClick={handleSubmitForReview}
              disabled={saving || submitting}
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit for Review'}
            </button>
          )}
        </div>
      </form>

      {vocabulary && (
        <div className="mt-6 rounded-lg bg-slate-50 p-4">
          <p className="text-sm text-slate-600">Status</p>
          <p className="mt-1 font-semibold text-slate-900">
            {vocabulary.status}
          </p>
        </div>
      )}

      {message && (
        <p className="mt-4 text-sm text-green-700">{message}</p>
      )}

      {error && (
        <p className="mt-4 text-sm text-red-600">{error}</p>
      )}
    </section>
  );
}
