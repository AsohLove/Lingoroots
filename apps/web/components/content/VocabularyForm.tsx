'use client';

import { useState } from 'react';

import { api } from '../../lib/api';

type VocabularyFormProps = {
  lessonId: string;
};

type CreateVocabularyResponse = {
  id: string;
};

export default function VocabularyForm({
  lessonId,
}: VocabularyFormProps) {
  const [term, setTerm] = useState('');
  const [translation, setTranslation] = useState('');
  const [notes, setNotes] = useState('');

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      const result = await api<CreateVocabularyResponse>(
        `/lessons/${lessonId}/vocabulary`,
        {
          method: 'POST',
          body: {
            term,
            meaning: translation,
            explanation: notes || undefined,
          },
        },
      );

      console.log('Created vocabulary:', result);

      setMessage(
        'Vocabulary saved successfully as a draft.',
      );

      setTerm('');
      setTranslation('');
      setNotes('');
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Failed to save vocabulary.',
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h3 className="font-semibold text-slate-900">
          Create vocabulary
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          Add a vocabulary item to the selected course.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >
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
            placeholder="Enter the language term"
            required
            className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        <div>
          <label
            htmlFor="translation"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Translation
          </label>

          <input
            id="translation"
            value={translation}
            onChange={(event) =>
              setTranslation(event.target.value)
            }
            placeholder="Enter the translation"
            required
            className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        <div>
          <label
            htmlFor="notes"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Notes
          </label>

          <textarea
            id="notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Optional explanation or context"
            rows={4}
            className="w-full resize-none rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        {message && (
          <div className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {message}
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={saving || !lessonId}
          className="rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save draft'}
        </button>
      </form>
    </section>
  );
}