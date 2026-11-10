
"use client";

import { useEffect, useState } from "react";

import {
  createContributorApplication,
  getLanguageVariants,
  getLanguages,
  getMyContributorApplications,
  updateContributorApplication,
} from "../../lib/governance";

import type {
  ContributorApplication,
  LanguageOption,
  LanguageVariant,
} from "../../types/governance";

const initialExpertise = "";

function Status({ value }: { value: string }) {
  const styles: Record<string, string> = {
    PENDING: "bg-amber-100 text-amber-800",
    UNDER_REVIEW: "bg-blue-100 text-blue-800",
    CHANGES_REQUESTED: "bg-orange-100 text-orange-800",
    APPROVED: "bg-green-100 text-green-800",
    REJECTED: "bg-red-100 text-red-800",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        styles[value] ?? "bg-slate-100 text-slate-700"
      }`}
    >
      {value.replaceAll("_", " ")}
    </span>
  );
}

export default function ContributorApplicationsWorkspace() {
  const [languages, setLanguages] = useState<LanguageOption[]>([]);
  const [variants, setVariants] = useState<LanguageVariant[]>([]);
  const [applications, setApplications] = useState<
    ContributorApplication[]
  >([]);

  const [languageId, setLanguageId] = useState("");
  const [variantId, setVariantId] = useState("");
  const [expertiseStatement, setExpertiseStatement] =
    useState(initialExpertise);
  const [evidenceText, setEvidenceText] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadApplications() {
    const data = await getMyContributorApplications();
    setApplications(data);
  }

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [languageData, applicationData] = await Promise.all([
          getLanguages(),
          getMyContributorApplications(),
        ]);

        if (cancelled) return;

        setLanguages(languageData);
        setApplications(applicationData);

        if (languageData.length > 0) {
          setLanguageId(languageData[0].id);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load contributor applications.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadVariants() {
      setVariants([]);

      if (!languageId) return;

      try {
        const data = await getLanguageVariants(languageId);

        if (!cancelled) {
          setVariants(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load language variants.",
          );
        }
      }
    }

    void loadVariants();

    return () => {
      cancelled = true;
    };
  }, [languageId]);

  function resetForm() {
    setEditingId(null);
    setExpertiseStatement("");
    setEvidenceText("");
    setVariantId("");
    setSuccess("");
    setError("");
  }

  function beginEditing(application: ContributorApplication) {
    setEditingId(application.id);
    setLanguageId(application.languageId);
    setVariantId(application.variantId ?? "");
    setExpertiseStatement(application.expertiseStatement);
    setEvidenceText(application.evidenceUrls.join("\n"));
    setSuccess("");
    setError("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    const evidenceUrls = evidenceText
      .split(/\r?\n/)
      .map((url) => url.trim())
      .filter(Boolean);

    try {
      if (editingId) {
        await updateContributorApplication(editingId, {
          languageId,
          variantId: variantId || null,
          expertiseStatement,
          evidenceUrls,
        });

        setSuccess("Your application has been updated and resubmitted.");
      } else {
        await createContributorApplication({
          languageId,
          ...(variantId ? { variantId } : {}),
          expertiseStatement,
          evidenceUrls,
        });

        setSuccess("Your contributor application has been submitted.");
      }

      resetForm();
      await loadApplications();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to submit your application.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <p className="text-sm text-slate-500">
        Loading contributor workspace...
      </p>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">
          Contributor applications
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Apply to contribute learning content for a language or
          one of its variants. Applications are reviewed before
          contributor access is granted.
        </p>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="text-lg font-semibold text-slate-900">
          {editingId ? "Update your application" : "Apply to become a contributor"}
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          Explain your language knowledge, experience, and ability
          to contribute accurate learning material.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label
                htmlFor="application-language"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Language
              </label>

              <select
                id="application-language"
                value={languageId}
                onChange={(event) => {setLanguageId(event.target.value); setVariantId("");}}
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm text-slate-900"
              >
                <option value="" disabled>
                  Select a language
                </option>
                {languages.map((language) => (
                  <option key={language.id} value={language.id}>
                    {language.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="application-variant"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Variant
              </label>

              <select
                id="application-variant"
                value={variantId}
                onChange={(event) => setVariantId(event.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm text-slate-900"
              >
                <option value="">Language-wide access</option>
                {variants.map((variant) => (
                  <option key={variant.id} value={variant.id}>
                    {variant.name}
                  </option>
                ))}
              </select>

              <p className="mt-1 text-xs text-slate-500">
                Choose a variant if your expertise is specific to one.
              </p>
            </div>
          </div>

          <div>
            <label
              htmlFor="expertise"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Your expertise and experience
            </label>

            <textarea
              id="expertise"
              value={expertiseStatement}
              onChange={(event) =>
                setExpertiseStatement(event.target.value)
              }
              minLength={30}
              maxLength={5000}
              required
              rows={6}
              placeholder="Describe your proficiency, connection to the language, experience teaching or documenting it, and the kinds of learning content you can contribute."
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />

            <p className="mt-1 text-right text-xs text-slate-400">
              {expertiseStatement.length}/5000 characters
            </p>
          </div>

          <div>
            <label
              htmlFor="evidence"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Evidence links (optional)
            </label>

            <textarea
              id="evidence"
              value={evidenceText}
              onChange={(event) => setEvidenceText(event.target.value)}
              rows={3}
              placeholder={"https://example.com/portfolio\nhttps://example.com/research"}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />

            <p className="mt-1 text-xs text-slate-500">
              Enter up to 10 HTTPS links, one per line. These could
              include publications, recordings, portfolios, or other
              relevant evidence.
            </p>
          </div>

          {error && (
            <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </p>
          )}

          {success && (
            <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
              {success}
            </p>
          )}

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving || !languageId}
              className="rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? "Submitting..."
                : editingId
                  ? "Save and resubmit"
                  : "Submit application"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel editing
              </button>
            )}
          </div>
        </form>
      </section>

      <section>
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-slate-900">
            Your application history
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Track your applications and read administrator feedback.
          </p>
        </div>

        {applications.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
            <p className="font-medium text-slate-700">
              No applications yet
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Submit an application to request contributor access.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((application) => (
              <article
                key={application.id}
                className="rounded-xl border border-slate-200 bg-white p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h4 className="font-semibold text-slate-900">
                      {application.language.name}
                      {application.variant
                        ? ` — ${application.variant.name}`
                        : " — Language-wide"}
                    </h4>
                    <p className="mt-1 text-xs text-slate-500">
                      Submitted{" "}
                      {new Date(application.submittedAt).toLocaleString()}
                    </p>
                  </div>

                  <Status value={application.status} />
                </div>

                <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                  {application.expertiseStatement}
                </p>

                {application.evidenceUrls.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-semibold text-slate-500">
                      Evidence
                    </p>
                    <ul className="mt-1 space-y-1">
                      {application.evidenceUrls.map((url) => (
                        <li key={url}>
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="break-all text-sm text-indigo-600 hover:underline"
                          >
                            {url}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {application.reviews.length > 0 && (
                  <div className="mt-5 border-t border-slate-100 pt-4">
                    <h5 className="text-sm font-semibold text-slate-800">
                      Review history
                    </h5>

                    <div className="mt-3 space-y-3">
                      {application.reviews.map((review) => (
                        <div
                          key={review.id}
                          className="rounded-lg bg-slate-50 p-3"
                        >
                          <div className="flex flex-wrap justify-between gap-2">
                            <span className="text-xs font-semibold text-slate-700">
                              {review.reviewer.name}
                            </span>
                            <span className="text-xs text-slate-500">
                              {review.decision.replaceAll("_", " ")}
                              {" · "}
                              {new Date(review.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">
                            {review.comment}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {application.status === "CHANGES_REQUESTED" && (
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={() => beginEditing(application)}
                      className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700"
                    >
                      Update application
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
