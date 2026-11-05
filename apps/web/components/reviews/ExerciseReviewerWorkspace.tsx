"use client";

import { useCallback, useEffect, useState } from "react";

import {
  approveExercise,
  getExerciseReviewQueue,
  rejectExercise,
  requestExerciseChanges,
  startExerciseReview,
  type Exercise,
} from "../../lib/exercises";

export function ExerciseReviewWorkspace() {
  const [items, setItems] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadReviews = useCallback(async (isActive: () => boolean = () => true) => {


    try {
      const result = await getExerciseReviewQueue();

      if (isActive()) {
        setItems(result);
      }
    } catch (err) {
      if (isActive()) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load exercise reviews.",
        );
      }
    } finally {
      if (isActive()) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
  let cancelled = false;

  getExerciseReviewQueue()
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
            : "Unable to load exercise reviews.",
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

  async function handleStart(id: string) {
    setBusyId(id);
    setError("");
    setMessage("");

    try {
      await startExerciseReview(id);

      setMessage("Review started. You can now make a decision.");
      await loadReviews();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to start review.",
      );
    } finally {
      setBusyId(null);
    }
  }

  async function handleDecision(
    exercise: Exercise,
    decision: "approve" | "changes" | "reject",
  ) {
    let comment = "";

    if (decision !== "approve") {
      const enteredComment = window
        .prompt(
          decision === "changes"
            ? "Explain what the contributor should change:"
            : "Explain why this exercise is being rejected:",
        )
        ?.trim();

      if (!enteredComment) {
        return;
      }

      comment = enteredComment;
    }

    setBusyId(exercise.id);
    setError("");
    setMessage("");

    try {
      if (decision === "approve") {
        await approveExercise(exercise.id);
        setMessage("Exercise approved and published.");
      } else if (decision === "changes") {
        await requestExerciseChanges(exercise.id, comment);
        setMessage("Changes requested from the contributor.");
      } else {
        await rejectExercise(exercise.id, comment);
        setMessage("Exercise rejected.");
      }

      await loadReviews();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Review decision failed.",
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
            Exercise reviews
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Review submitted exercises before they become available to learners.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void handleRefresh()}
          disabled={loading}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 disabled:opacity-50"
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
        <p
          role="alert"
          className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-sm text-slate-500">
          Loading exercise submissions...
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
          <h2 className="font-semibold text-slate-900">
            No exercises awaiting review
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Submitted exercises will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((exercise) => {
            const underReview = exercise.status === "UNDER_REVIEW";
            const busy = busyId === exercise.id;

            return (
              <article
                key={exercise.id}
                className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-indigo-600">
                      {exercise.type.replace("_", " ")}
                    </p>

                    <h2 className="mt-2 text-lg font-semibold text-slate-900">
                      {exercise.prompt}
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Lesson: {exercise.lesson?.name ?? "Unknown lesson"}
                      {" · "}
                      Contributor: {exercise.createdBy?.name ?? "Unknown"}
                    </p>
                  </div>

                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                    {exercise.status.replace("_", " ")}
                  </span>
                </div>

                {exercise.type === "MULTIPLE_CHOICE" && (
                  <div className="mt-5 space-y-2">
                    {exercise.options.map((option) => (
                      <div
                        key={option.id}
                        className={`rounded-lg border px-3 py-2 text-sm ${
                          option.isCorrect
                            ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                            : "border-slate-200 text-slate-700"
                        }`}
                      >
                        {option.text}

                        {option.isCorrect && (
                          <span className="ml-2 text-xs font-semibold">
                            Correct answer
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {exercise.type === "TEXT_INPUT" && (
                  <div className="mt-5 rounded-lg bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase text-slate-500">
                      Accepted answers
                    </p>

                    <p className="mt-2 text-sm text-slate-700">
                      {exercise.acceptedAnswers
                        ?.map((answer) => answer.value)
                        .join(", ") || "No accepted answers provided."}
                    </p>
                  </div>
                )}

                {exercise.explanation && (
                  <p className="mt-4 text-sm text-slate-600">
                    <strong>Explanation:</strong> {exercise.explanation}
                  </p>
                )}

                <div className="mt-6 flex flex-wrap gap-3">
                  {exercise.status === "SUBMITTED" && (
                    <button
                      type="button"
                      onClick={() => void handleStart(exercise.id)}
                      disabled={busy || busyId !== null}
                      className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                    >
                      {busy ? "Starting..." : "Start review"}
                    </button>
                  )}

                  {underReview && (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          void handleDecision(exercise, "approve")
                        }
                        disabled={busy || busyId !== null}
                        className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                      >
                        {busy ? "Saving..." : "Approve & publish"}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          void handleDecision(exercise, "changes")
                        }
                        disabled={busy || busyId !== null}
                        className="rounded-lg border border-amber-300 px-4 py-2 text-sm font-medium text-amber-800 disabled:opacity-50"
                      >
                        Request changes
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          void handleDecision(exercise, "reject")
                        }
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