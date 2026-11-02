"use client";

import { useEffect, useState } from "react";
import {
  approveVocabulary,
  getSubmittedVocabulary,
  requestVocabularyChanges,
  rejectVocabulary,
  startVocabularyReview,
  type ReviewVocabularyItem,
} from "../../lib/reviews";

export function ReviewWorkspace() {
  const [items, setItems] = useState<ReviewVocabularyItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadReviews() {
    setLoading(true);
    setError("");

    try {
      const result = await getSubmittedVocabulary();
      setItems(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load submitted content.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadReviews();
  }, []);

  async function handleStartReview(vocabularyId: string) {
    try {
      const updated = await startVocabularyReview(vocabularyId);

      setItems((currentItems) =>
        currentItems.map((item) => (item.id === vocabularyId ? updated : item)),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start review.");
    }
  }

  async function handleApprove(vocabularyId: string) {
    try {
      await approveVocabulary(vocabularyId);
      await loadReviews();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to approve vocabulary.",
      );
    }
  }

  async function handleRequestChanges(vocabularyId: string) {
    const comment = window.prompt("What changes should the contributor make?");

    if (!comment?.trim()) {
      return;
    }

    try {
      await requestVocabularyChanges(vocabularyId, comment);

      await loadReviews();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to request changes.",
      );
    }
  }

  async function handleReject(vocabularyId: string) {
    const comment = window.prompt("Why is this content being rejected?");

    if (!comment?.trim()) {
      return;
    }

    try {
      await rejectVocabulary(vocabularyId, comment);

      await loadReviews();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to reject vocabulary.",
      );
    }
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Content Reviews
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Review submitted learning content and manage reviews you have already
          started.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          Loading submitted content...
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
          <p className="font-medium text-slate-900">No content to review</p>

          <p className="mt-1 text-sm text-slate-500">
            New submissions and active reviews will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <article
              key={item.id}
              className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    {item.term}
                  </h2>

                  <p className="mt-1 text-slate-600">{item.meaning}</p>

                  {item.explanation && (
                    <p className="mt-3 text-sm text-slate-500">
                      {item.explanation}
                    </p>
                  )}
                </div>

                <span className="inline-flex w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                  {item.status}
                </span>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                {item.status === "SUBMITTED" && (
                  <button
                    type="button"
                    onClick={() => handleStartReview(item.id)}
                    className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white"
                  >
                    Start Review
                  </button>
                )}

                {item.status === "UNDER_REVIEW" && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleApprove(item.id)}
                      className="rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white"
                    >
                      Approve
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRequestChanges(item.id)}
                      className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
                    >
                      Request Changes
                    </button>

                    <button
                      type="button"
                      onClick={() => handleReject(item.id)}
                      className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-700"
                    >
                      Reject
                    </button>
                  </>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
