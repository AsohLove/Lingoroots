
"use client";

import { useEffect, useState } from "react";

import {
  getAdminAuthorizations,
  getAdminContributorApplications,
  reviewContributorApplication,
  revokeLanguageAuthorization,
} from "../../lib/governance";

import type {
  ContributorApplication,
  ContributorApplicationDecision,
  LanguageAuthorizationRecord,
} from "../../types/governance";

const decisions: {
  value: ContributorApplicationDecision;
  label: string;
}[] = [
  { value: "APPROVED", label: "Approve" },
  { value: "CHANGES_REQUESTED", label: "Request changes" },
  { value: "REJECTED", label: "Reject" },
];

export default function AdminGovernanceWorkspace() {
  const [applications, setApplications] = useState<
    ContributorApplication[]
  >([]);
  const [authorizations, setAuthorizations] = useState<
    LanguageAuthorizationRecord[]
  >([]);

  const [comments, setComments] = useState<Record<string, string>>({});
  const [revocationReasons, setRevocationReasons] = useState<
    Record<string, string>
  >({});

  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function refresh() {
    const [applicationData, authorizationData] = await Promise.all([
      getAdminContributorApplications(),
      getAdminAuthorizations(),
    ]);

    setApplications(applicationData);
    setAuthorizations(authorizationData);
  }

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [applicationData, authorizationData] = await Promise.all([
          getAdminContributorApplications(),
          getAdminAuthorizations(),
        ]);

        if (!cancelled) {
          setApplications(applicationData);
          setAuthorizations(authorizationData);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load governance data.",
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

  async function handleDecision(
    application: ContributorApplication,
    decision: ContributorApplicationDecision,
  ) {
    const comment = (comments[application.id] ?? "").trim();

    if (comment.length < 5) {
      setError("Enter a review comment of at least 5 characters.");
      return;
    }

    setWorkingId(application.id);
    setError("");
    setSuccess("");

    try {
      await reviewContributorApplication(
        application.id,
        decision,
        comment,
      );

      setComments((current) => ({
        ...current,
        [application.id]: "",
      }));

      setSuccess(
        `Application ${decision.toLowerCase().replaceAll("_", " ")} successfully.`,
      );

      await refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to review this application.",
      );
    } finally {
      setWorkingId(null);
    }
  }

  async function handleRevocation(
    authorization: LanguageAuthorizationRecord,
  ) {
    const reason = (
      revocationReasons[authorization.id] ?? ""
    ).trim();

    if (reason.length < 5) {
      setError("Enter a revocation reason of at least 5 characters.");
      return;
    }

    setWorkingId(authorization.id);
    setError("");
    setSuccess("");

    try {
      await revokeLanguageAuthorization(
        authorization.id,
        reason,
      );

      setRevocationReasons((current) => ({
        ...current,
        [authorization.id]: "",
      }));

      setSuccess("Language authorization revoked successfully.");

      await refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to revoke this authorization.",
      );
    } finally {
      setWorkingId(null);
    }
  }

  if (loading) {
    return (
      <p className="text-sm text-slate-500">
        Loading governance workspace...
      </p>
    );
  }

  const activeCount = authorizations.filter(
    (item) => item.revokedAt === null,
  ).length;

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">
          Contributor governance
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Review contributor applications and manage language-specific
          contributor authorizations.
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

      <section>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              Application review queue
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Applications awaiting an administrator decision.
            </p>
          </div>

          <span className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-semibold text-indigo-700">
            {applications.length} awaiting review
          </span>
        </div>

        {applications.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
            <p className="font-medium text-slate-700">
              No applications awaiting review
            </p>
            <p className="mt-1 text-sm text-slate-500">
              New applications will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {applications.map((application) => (
              <article
                key={application.id}
                className="rounded-xl border border-slate-200 bg-white p-6"
              >
                <div className="flex flex-wrap justify-between gap-3">
                  <div>
                    <h4 className="font-semibold text-slate-900">
                      {application.user?.name ?? "Unknown applicant"}
                    </h4>
                    <p className="mt-1 text-sm text-slate-500">
                      {application.user?.email}
                    </p>
                  </div>

                  <span className="h-fit rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                    {application.status.replaceAll("_", " ")}
                  </span>
                </div>

                <div className="mt-4 grid gap-3 rounded-lg bg-slate-50 p-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Requested language
                    </p>
                    <p className="mt-1 text-sm font-medium text-slate-800">
                      {application.language.name}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Requested scope
                    </p>
                    <p className="mt-1 text-sm font-medium text-slate-800">
                      {application.variant?.name ?? "Entire language"}
                    </p>
                  </div>
                </div>

                <div className="mt-5">
                  <h5 className="text-sm font-semibold text-slate-800">
                    Expertise statement
                  </h5>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                    {application.expertiseStatement}
                  </p>
                </div>

                {application.reviews.length > 0 && (
                  <div className="mt-4">
                    <h5 className="text-sm font-semibold text-slate-800">
                      Previous review comments
                    </h5>
                    <div className="mt-2 space-y-2">
                      {application.reviews.map((review) => (
                        <div
                          key={review.id}
                          className="rounded-lg border border-slate-100 p-3"
                        >
                          <p className="text-xs text-slate-500">
                            {review.reviewer.name} ·{" "}
                            {review.decision.replaceAll("_", " ")}
                          </p>
                          <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">
                            {review.comment}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {application.evidenceUrls.length > 0 && (
                  <div className="mt-4">
                    <h5 className="text-sm font-semibold text-slate-800">
                      Evidence
                    </h5>
                    <ul className="mt-2 space-y-1">
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

                <div className="mt-5 border-t border-slate-100 pt-5">
                  <label
                    htmlFor={`review-comment-${application.id}`}
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Decision comment
                  </label>

                  <textarea
                    id={`review-comment-${application.id}`}
                    value={comments[application.id] ?? ""}
                    onChange={(event) =>
                      setComments((current) => ({
                        ...current,
                        [application.id]: event.target.value,
                      }))
                    }
                    rows={3}
                    minLength={5}
                    maxLength={2000}
                    placeholder="Explain your decision. For requested changes, be specific about what the applicant needs to address."
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />

                  <div className="mt-3 flex flex-wrap gap-2">
                    {decisions.map((decision) => (
                      <button
                        key={decision.value}
                        type="button"
                        disabled={workingId === application.id}
                        onClick={() =>
                          void handleDecision(
                            application,
                            decision.value,
                          )
                        }
                        className={`rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-50 ${
                          decision.value === "APPROVED"
                            ? "bg-green-600 text-white hover:bg-green-700"
                            : decision.value === "REJECTED"
                              ? "bg-red-600 text-white hover:bg-red-700"
                              : "bg-orange-500 text-white hover:bg-orange-600"
                        }`}
                      >
                        {workingId === application.id
                          ? "Processing..."
                          : decision.label}
                      </button>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-slate-900">
            Language authorizations
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Review contributor access and revoke grants when necessary.
          </p>
        </div>

        <div className="mb-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">Active authorizations</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {activeCount}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">Revoked authorizations</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {authorizations.length - activeCount}
            </p>
          </div>
        </div>

        {authorizations.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
            No language authorizations have been recorded.
          </div>
        ) : (
          <div className="space-y-4">
            {authorizations.map((authorization) => {
              const active = authorization.revokedAt === null;

              return (
                <article
                  key={authorization.id}
                  className="rounded-xl border border-slate-200 bg-white p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h4 className="font-semibold text-slate-900">
                        {authorization.user.name}
                      </h4>
                      <p className="mt-1 text-sm text-slate-500">
                        {authorization.user.email}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        active
                          ? "bg-green-100 text-green-800"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {active ? "ACTIVE" : "REVOKED"}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-xs text-slate-400">Language</p>
                      <p className="mt-1 text-sm font-medium text-slate-800">
                        {authorization.language.name}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-400">Scope</p>
                      <p className="mt-1 text-sm font-medium text-slate-800">
                        {authorization.variant?.name ?? "Entire language"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 text-xs text-slate-500">
                    Granted{" "}
                    {new Date(authorization.createdAt).toLocaleString()}
                    {authorization.grantedBy && (
                      <> by {authorization.grantedBy.name}</>
                    )}
                  </div>

                  {!active && (
                    <div className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
                      <p>
                        Revoked{" "}
                        {authorization.revokedAt
                          ? new Date(
                              authorization.revokedAt,
                            ).toLocaleString()
                          : ""}
                        {authorization.revokedBy &&
                          ` by ${authorization.revokedBy.name}`}
                      </p>
                      {authorization.revocationReason && (
                        <p className="mt-1">
                          Reason: {authorization.revocationReason}
                        </p>
                      )}
                    </div>
                  )}

                  {active && (
                    <div className="mt-4 border-t border-slate-100 pt-4">
                      <label
                        htmlFor={`revoke-${authorization.id}`}
                        className="mb-2 block text-sm font-medium text-slate-700"
                      >
                        Revocation reason
                      </label>

                      <textarea
                        id={`revoke-${authorization.id}`}
                        rows={2}
                        minLength={5}
                        maxLength={2000}
                        value={
                          revocationReasons[authorization.id] ?? ""
                        }
                        onChange={(event) =>
                          setRevocationReasons((current) => ({
                            ...current,
                            [authorization.id]: event.target.value,
                          }))
                        }
                        placeholder="Explain why this contributor's access is being revoked."
                        className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                      />

                      <button
                        type="button"
                        disabled={workingId === authorization.id}
                        onClick={() =>
                          void handleRevocation(authorization)
                        }
                        className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                      >
                        {workingId === authorization.id
                          ? "Revoking..."
                          : "Revoke authorization"}
                      </button>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
