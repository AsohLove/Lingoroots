"use client";

import { useState, type FormEvent } from "react";

import {
  createExercise,
  submitExercise,
  updateExercise,
  type ContributorExercise,
  type Exercise,
  type ExerciseType,
} from "../../lib/exercises";

type ExerciseFormProps = {
  lessonId: string;
  initialExercise?: ContributorExercise;
  onComplete?: () => void | Promise<void>;
};

type EditableOption = {
  text: string;
  isCorrect: boolean;
};

const emptyOptions: EditableOption[] = [
  { text: "", isCorrect: true },
  { text: "", isCorrect: false },
  { text: "", isCorrect: false },
];

export function ExerciseForm({
  lessonId,
  initialExercise,
  onComplete,
}: ExerciseFormProps) {
  const [type, setType] = useState<ExerciseType>(
    initialExercise?.type ?? "MULTIPLE_CHOICE",
  );
  const [prompt, setPrompt] = useState(initialExercise?.prompt ?? "");
  const [explanation, setExplanation] = useState(
    initialExercise?.explanation ?? "",
  );
  const [options, setOptions] = useState<EditableOption[]>(
    initialExercise?.options.map((option) => ({
      text: option.text,
      isCorrect: option.isCorrect ?? false,
    })) ?? emptyOptions,
  );
  const [acceptedAnswers, setAcceptedAnswers] = useState(
    initialExercise?.acceptedAnswers
      ?.map((answer) => answer.value)
      .join("\n") ?? "",
  );

  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  function resetForm() {
    setType("MULTIPLE_CHOICE");
    setPrompt("");
    setExplanation("");
    setOptions(emptyOptions);
    setAcceptedAnswers("");
    setExercise(null);
    setMessage("");
    setError("");
  }

  function updateOption(
    index: number,
    field: "text" | "isCorrect",
    value: string | boolean,
  ) {
    setOptions((current) =>
      current.map((option, optionIndex) => {
        if (field === "isCorrect") {
          return { ...option, isCorrect: optionIndex === index };
        }

        return optionIndex === index
          ? { ...option, text: value as string }
          : option;
      }),
    );
  }

  function addOption() {
    if (options.length < 6) {
      setOptions((current) => [
        ...current,
        { text: "", isCorrect: false },
      ]);
    }
  }

  function removeOption(index: number) {
    if (options.length <= 2) {
      return;
    }

    setOptions((current) => {
      const remaining = current.filter(
        (_, optionIndex) => optionIndex !== index,
      );

      if (!remaining.some((option) => option.isCorrect)) {
        remaining[0] = {
          ...remaining[0],
          isCorrect: true,
        };
      }

      return remaining;
    });
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!prompt.trim()) {
      setError("Enter an exercise question.");
      return;
    }

    const explanationValue = initialExercise
      ? explanation.trim()
      : explanation.trim() || undefined;

    let input;

    if (type === "MULTIPLE_CHOICE") {
      const usableOptions = options.filter((option) =>
        option.text.trim(),
      );

      if (usableOptions.length < 2) {
        setError("Add at least two non-empty answer options.");
        return;
      }

      if (
        usableOptions.filter((option) => option.isCorrect).length !== 1
      ) {
        setError("Mark exactly one answer as correct.");
        return;
      }

      input = {
        type,
        prompt: prompt.trim(),
        explanation: explanationValue,
        order: initialExercise?.order ?? 0,
        options: usableOptions.map((option, index) => ({
          text: option.text.trim(),
          order: index,
          isCorrect: option.isCorrect,
        })),
        acceptedAnswers: [],
      };
    } else {
      const answers = [
        ...new Set(
          acceptedAnswers
            .split("\n")
            .map((answer) => answer.trim())
            .filter(Boolean),
        ),
      ];

      if (answers.length === 0) {
        setError("Enter at least one accepted answer.");
        return;
      }

      input = {
        type,
        prompt: prompt.trim(),
        explanation: explanationValue,
        order: initialExercise?.order ?? 0,
        options: [],
        acceptedAnswers: answers,
      };
    }

    setSaving(true);

    try {
      const saved = initialExercise
        ? await updateExercise(initialExercise.id, input)
        : await createExercise(lessonId, input);

      setExercise(saved);

      setMessage(
        initialExercise
          ? "Changes saved. Review the updated exercise before resubmitting."
          : "Exercise saved as a draft. Review it before submitting.",
      );

      await onComplete?.();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not save the exercise.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmit() {
    if (!exercise) {
      return;
    }

    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      const updated = await submitExercise(exercise.id);

      setExercise(updated);
      setMessage("Exercise submitted successfully for review.");

      await onComplete?.();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not submit the exercise.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  const currentExercise = exercise ?? initialExercise;

  const isDraft =
    currentExercise?.status === "DRAFT" ||
    currentExercise?.status === "CHANGES_REQUESTED";

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-900">
          {initialExercise ? "Edit exercise" : "Create an exercise"}
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          {initialExercise
            ? "Update the exercise using the review feedback."
            : "Add a practice question to the selected lesson."}
        </p>
      </div>

      {currentExercise && exercise ? (
        <div className="space-y-4">
          <div className="rounded-lg border border-slate-200 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Saved exercise
            </p>

            <h3 className="mt-2 font-semibold text-slate-900">
              {exercise.prompt}
            </h3>

            <p className="mt-2 text-sm text-slate-600">
              Type: {exercise.type.replaceAll("_", " ")}
            </p>

            <p className="mt-2 text-sm text-slate-600">
              Status: <strong>{exercise.status.replaceAll("_", " ")}</strong>
            </p>
          </div>

          {isDraft && (
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setExercise(null)}
                disabled={saving || submitting}
                className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 disabled:opacity-50"
              >
                Continue editing
              </button>

              <button
                type="button"
                onClick={() => void handleSubmit()}
                disabled={submitting || saving}
                className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Submit for review"}
              </button>
            </div>
          )}

          {!isDraft && (
            <p className="text-sm text-slate-600">
              This exercise has been submitted. You can track its status in
              My Submissions.
            </p>
          )}

          {!initialExercise && (
            <button
              type="button"
              onClick={resetForm}
              disabled={saving || submitting}
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 disabled:opacity-50"
            >
              Create another exercise
            </button>
          )}
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label
              htmlFor="exercise-type"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Exercise type
            </label>

            <select
              id="exercise-type"
              value={type}
              onChange={(event) =>
                setType(event.target.value as ExerciseType)
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900"
            >
              <option value="MULTIPLE_CHOICE">Multiple choice</option>
              <option value="TEXT_INPUT">Text input</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="exercise-prompt"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Question
            </label>

            <textarea
              id="exercise-prompt"
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              rows={3}
              required
              placeholder="Enter the question learners will answer"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm text-slate-900"
            />
          </div>

          {type === "MULTIPLE_CHOICE" ? (
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-medium text-slate-700">
                  Answer options
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Select the radio button beside the one correct answer.
                </p>
              </div>

              {options.map((option, index) => (
                <div key={index} className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="correct-option"
                    checked={option.isCorrect}
                    onChange={() =>
                      updateOption(index, "isCorrect", true)
                    }
                    aria-label={`Mark option ${index + 1} as correct`}
                    className="h-4 w-4 accent-indigo-600"
                  />

                  <input
                    value={option.text}
                    onChange={(event) =>
                      updateOption(index, "text", event.target.value)
                    }
                    placeholder={`Option ${index + 1}`}
                    className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
                  />

                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(index)}
                      className="text-sm text-red-600"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}

              {options.length < 6 && (
                <button
                  type="button"
                  onClick={addOption}
                  className="text-sm font-medium text-indigo-600"
                >
                  + Add another option
                </button>
              )}
            </div>
          ) : (
            <div>
              <label
                htmlFor="accepted-answers"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Accepted answers
              </label>

              <textarea
                id="accepted-answers"
                value={acceptedAnswers}
                onChange={(event) =>
                  setAcceptedAnswers(event.target.value)
                }
                rows={4}
                placeholder={"Mbolo\nMbolo!"}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm"
              />

              <p className="mt-1 text-xs text-slate-500">
                Enter one accepted answer per line. Accents and diacritics
                are preserved.
              </p>
            </div>
          )}

          <div>
            <label
              htmlFor="exercise-explanation"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Explanation (optional)
            </label>

            <textarea
              id="exercise-explanation"
              value={explanation}
              onChange={(event) => setExplanation(event.target.value)}
              rows={3}
              placeholder="Explain why the answer is correct."
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={saving || submitting}
            className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
          >
            {saving
              ? "Saving..."
              : initialExercise
                ? "Save changes"
                : "Save draft"}
          </button>
        </form>
      )}

      {message && (
        <p role="status" className="mt-4 text-sm text-emerald-700">
          {message}
        </p>
      )}

      {error && (
        <p role="alert" className="mt-4 text-sm text-red-700">
          {error}
        </p>
      )}
    </section>
  );
}