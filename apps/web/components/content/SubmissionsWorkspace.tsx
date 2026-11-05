"use client";

import { useCallback, useEffect, useState } from "react";

import {
  getMyExercises,
  type ContributorExercise,
} from "../../lib/exercises";

import { ExerciseForm } from "./ExerciseForm";

export default function SubmissionsWorkspace() {
  const [items, setItems] = useState<ContributorExercise[]>([]);
  const [selected, setSelected] = useState<ContributorExercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadSubmissions = useCallback(async () => {
    setError("");

    try {
      const result = await getMyExercises();

      setItems(result);

      setSelected((current) =>
        current
          ? result.find((item) => item.id === current.id) ?? null
          : null,
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load your submissions.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial request. Keep it directly in the effect to satisfy the
  // react-hooks/set-state-in-effect lint rule.
  useEffect(() => {
    let cancelled = false;

    getMyExercises()
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
              : "Unable to load your submissions.",
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

  async function handleRefresh() {
    setLoading(true);
    await loadSubmissions();
  }

  const sortedReviews = selected
    ? [...selected.reviews].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime(),
      )
    : [];

  if (selected) {
    const canEdit =
      selected.status === "DRAFT" ||
      selected.status === "CHANGES_REQUESTED";

    const latestReview = sortedReviews[0];

    return (
      <section className="space-y-6">
        <button
          type="button"
          onClick={() => setSelected(null)}
          className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
        >
          ← Back to submissions
        </button>

        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Submission details
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            {selected.lesson.name} · {selected.status.replaceAll("_", " ")}
          </p>
        </div>

        {error && (
          <p
            role="alert"
            className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </p>
        )}

        {latestReview?.comment && (
          <section className="rounded-xl border border-amber-200 bg-amber-50 p-6">
            <h2 className="font-semibold text-amber-950">
              Latest reviewer feedback
            </h2>

            <p className="mt-2 whitespace-pre-wrap text-sm text-amber-950">
              {latestReview.comment}
            </p>

            <p className="mt-3 text-xs text-amber-800">
              {latestReview.reviewer.name} ·{" "}
              {new Date(latestReview.createdAt).toLocaleString()}
            </p>
          </section>
        )}

        {sortedReviews.length > 0 && (
          <section className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="font-semibold text-slate-900">
              Review history
            </h2>

            <div className="mt-4 space-y-5">
              {sortedReviews.map((review) => (
                <article
                  key={review.id}
                  className="border-l-2 border-indigo-200 pl-4"
                >
                  <p className="text-sm font-medium text-slate-900">
                    {review.status.replaceAll("_", " ")}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {review.reviewer.name} ·{" "}
                    {new Date(review.createdAt).toLocaleString()}
                  </p>

                  {review.comment && (
                    <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">
                      {review.comment}
                    </p>
                  )}
                </article>
              ))}
            </div>
          </section>
        )}

        {canEdit ? (
          <ExerciseForm
            key={selected.id}
            lessonId={selected.lessonId}
            initialExercise={selected}
            onComplete={loadSubmissions}
          />
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="font-semibold text-slate-900">
              {selected.prompt}
            </h2>

            <p className="mt-2 text-sm text-slate-600">
              This exercise cannot currently be edited. Only drafts and
              exercises returned for changes can be edited.
            </p>
          </div>
        )}
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            My submissions
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Track your exercises, review decisions, and requested changes.
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
          Loading your submissions...
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
          <h2 className="font-semibold text-slate-900">
            No exercise submissions yet
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Exercises you create will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => {
            const latestReview = [...item.reviews].sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime(),
            )[0];

            const canEdit =
              item.status === "DRAFT" ||
              item.status === "CHANGES_REQUESTED";

            return (
              <article
                key={item.id}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-indigo-600">
                      {item.type.replaceAll("_", " ")}
                    </p>

                    <h2 className="mt-2 font-semibold text-slate-900">
                      {item.prompt}
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Lesson: {item.lesson.name}
                    </p>
                  </div>

                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                    {item.status.replaceAll("_", " ")}
                  </span>
                </div>

                {latestReview?.comment && (
                  <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">
                      Latest reviewer feedback
                    </p>

                    <p className="mt-1 whitespace-pre-wrap text-sm text-amber-950">
                      {latestReview.comment}
                    </p>

                    <p className="mt-2 text-xs text-amber-800">
                      {latestReview.reviewer.name}
                    </p>
                  </div>
                )}

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setSelected(item)}
                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    View details
                  </button>

                  {canEdit && (
                    <button
                      type="button"
                      onClick={() => setSelected(item)}
                      className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                    >
                      Edit exercise
                    </button>
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