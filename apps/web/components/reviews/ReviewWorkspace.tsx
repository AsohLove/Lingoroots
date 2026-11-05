"use client";

import { useCallback, useEffect, useState } from "react";

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
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadReviews = useCallback(
    async (isActive: () => boolean = () => true) => {
      try {
        const result = await getSubmittedVocabulary();

        if (isActive()) {
          setItems(result);
        }
      } catch (err) {
        if (isActive()) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load submitted content.",
          );
        }
      } finally {
        if (isActive()) {
          setLoading(false);
        }
      }
    },
    [],
  );

  useEffect(() => {
    let cancelled = false;

    getSubmittedVocabulary()
      .then((result) => {
        if (!cancelled) {
          setItems(result);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load submitted content.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleStartReview(vocabularyId: string) {
    setBusyId(vocabularyId);
    setError("");
    setMessage("");

    try {
      const updated = await startVocabularyReview(vocabularyId);

      setItems((currentItems) =>
        currentItems.map((item) => (item.id === vocabularyId ? updated : item)),
      );

      setMessage("Vocabulary review started.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start review.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleApprove(vocabularyId: string) {
    setBusyId(vocabularyId);
    setError("");
    setMessage("");

    try {
      await approveVocabulary(vocabularyId);
      setMessage("Vocabulary approved and published.");
      await loadReviews();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to approve vocabulary.",
      );
    } finally {
      setBusyId(null);
    }
  }

  async function handleRequestChanges(vocabularyId: string) {
    const comment = window
      .prompt("What changes should the contributor make?")
      ?.trim();

    if (!comment) {
      return;
    }

    setBusyId(vocabularyId);
    setError("");
    setMessage("");

    try {
      await requestVocabularyChanges(vocabularyId, comment);

      setMessage("Changes requested from the contributor.");
      await loadReviews();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to request changes.",
      );
    } finally {
      setBusyId(null);
    }
  }

  async function handleReject(vocabularyId: string) {
    const comment = window
      .prompt("Why is this content being rejected?")
      ?.trim();

    if (!comment) {
      return;
    }

    setBusyId(vocabularyId);
    setError("");
    setMessage("");

    try {
      await rejectVocabulary(vocabularyId, comment);

      setMessage("Vocabulary rejected.");
      await loadReviews();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to reject vocabulary.",
      );
    } finally {
      setBusyId(null);
    }
  }

  async function handleRefresh() {
    setLoading(true);
    setError("");
    setMessage("");

    await loadReviews();
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Content Reviews
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Review submitted learning content and manage reviews you have
            already started.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void handleRefresh()}
          disabled={loading}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 disabled:opacity-50"
        >
          Refresh
        </button>
      </div>

      {message && (
        <p
          role="status"
          className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800"
        >
          {message}
        </p>
      )}

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
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
          {items.map((item) => {
            const busy = busyId === item.id;

            return (
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
                    {item.status.replace("_", " ")}
                  </span>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  {item.status === "SUBMITTED" && (
                    <button
                      type="button"
                      onClick={() => void handleStartReview(item.id)}
                      disabled={busy || busyId !== null}
                      className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                    >
                      {busy ? "Starting..." : "Start Review"}
                    </button>
                  )}

                  {item.status === "UNDER_REVIEW" && (
                    <>
                      <button
                        type="button"
                        onClick={() => void handleApprove(item.id)}
                        disabled={busy || busyId !== null}
                        className="rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                      >
                        {busy ? "Saving..." : "Approve"}
                      </button>

                      <button
                        type="button"
                        onClick={() => void handleRequestChanges(item.id)}
                        disabled={busy || busyId !== null}
                        className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 disabled:opacity-50"
                      >
                        Request Changes
                      </button>

                      <button
                        type="button"
                        onClick={() => void handleReject(item.id)}
                        disabled={busy || busyId !== null}
                        className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-700 disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
