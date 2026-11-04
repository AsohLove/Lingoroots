"use client";

import { useEffect, useState } from "react";

import type { AuthenticatedUser } from "../../types/auth";
import type { LanguageAuthorization } from "../../types/authorization";

import { getMyAuthorizations } from "../../lib/authorizations";
import {
  getExerciseReviewQueue,
  getMyExercises,
} from "../../lib/exercises";
import { logout } from "../../lib/auth";

import DashboardHeader from "./DashboardHeader";
import DashboardSidebar from "./DashboardSidebar";
import StatCard from "./StatCard";
import RecentContent from "./RecentContent";
import AccessRoles from "./AccessRoles";
import ContentAccess from "./ContentAccess";

import ContentWorkspace from "../content/ContentWorkspace";
import SubmissionsWorkspace from "../content/SubmissionsWorkspace";
import { ReviewWorkspace } from "../reviews/ReviewWorkspace";
import { ExerciseReviewWorkspace } from "../reviews/ExerciseReviewerWorkspace";

type DashboardProps = {
  user: AuthenticatedUser;
  onLogout: () => void;
};

type DashboardStats = {
  submissions: number;
  drafts: number;
  changesRequested: number;
  awaitingReview: number;
};

const emptyStats: DashboardStats = {
  submissions: 0,
  drafts: 0,
  changesRequested: 0,
  awaitingReview: 0,
};

export default function Dashboard({ user, onLogout }: DashboardProps) {
  const isAdministrator = user.roles.includes("ADMINISTRATOR");
  const canContribute =
    isAdministrator || user.roles.includes("CONTRIBUTOR");
  const canReview = isAdministrator || user.roles.includes("REVIEWER");

  const [activePage, setActivePage] = useState("Dashboard");

  const [authorizations, setAuthorizations] = useState<
    LanguageAuthorization[]
  >([]);
  const [authorizationsLoading, setAuthorizationsLoading] =
    useState(canContribute);
  const [authorizationsError, setAuthorizationsError] = useState<
    string | null
  >(null);

  const [stats, setStats] = useState<DashboardStats>(emptyStats);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadDashboardData() {
      const tasks: Promise<void>[] = [];

      if (canContribute) {
        tasks.push(
          (async () => {
            try {
              const data = await getMyAuthorizations();

              if (!cancelled) {
                setAuthorizations(data);
                setAuthorizationsError(null);
              }
            } catch (error) {
              if (!cancelled) {
                setAuthorizationsError(
                  error instanceof Error
                    ? error.message
                    : "Failed to load content access.",
                );
              }
            } finally {
              if (!cancelled) {
                setAuthorizationsLoading(false);
              }
            }
          })(),
        );
      }

      tasks.push(
        (async () => {
          try {
            const [submissions, reviewQueue] = await Promise.all([
              canContribute ? getMyExercises() : Promise.resolve([]),
              canReview ? getExerciseReviewQueue() : Promise.resolve([]),
            ]);

            if (!cancelled) {
              setStats({
                submissions: submissions.length,
                drafts: submissions.filter(
                  (item) => item.status === "DRAFT",
                ).length,
                changesRequested: submissions.filter(
                  (item) => item.status === "CHANGES_REQUESTED",
                ).length,
                awaitingReview: reviewQueue.length,
              });

              setStatsError("");
            }
          } catch (error) {
            if (!cancelled) {
              setStatsError(
                error instanceof Error
                  ? error.message
                  : "Failed to load dashboard statistics.",
              );
            }
          } finally {
            if (!cancelled) {
              setStatsLoading(false);
            }
          }
        })(),
      );

      await Promise.all(tasks);
    }

    void loadDashboardData();

    return () => {
      cancelled = true;
    };
  }, [canContribute, canReview]);

  async function handleLogout() {
    try {
      await logout();
    } finally {
      onLogout();
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-100">
      <DashboardSidebar
        activePage={activePage}
        onNavigate={setActivePage}
        onLogout={handleLogout}
        roles={user.roles}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardHeader user={user} />

        <main className="flex-1 p-8">
          {activePage === "Content" && canContribute && (
            <ContentWorkspace />
          )}

          {activePage === "Submissions" && canContribute && (
            <SubmissionsWorkspace />
          )}

          {activePage === "Reviews" && canReview && (
            <div className="space-y-10">
              <ReviewWorkspace />

              <div className="border-t border-slate-200 pt-8">
                <ExerciseReviewWorkspace />
              </div>
            </div>
          )}

          {activePage === "Dashboard" && (
            <>
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                {canContribute && (
                  <>
                    <StatCard
                      label="My submissions"
                      value={
                        statsLoading ? "…" : String(stats.submissions)
                      }
                      description="Exercises created by you"
                    />

                    <StatCard
                      label="Drafts"
                      value={statsLoading ? "…" : String(stats.drafts)}
                      description="Exercises not yet submitted"
                    />

                    <StatCard
                      label="Changes requested"
                      value={
                        statsLoading
                          ? "…"
                          : String(stats.changesRequested)
                      }
                      description="Exercises requiring your attention"
                    />
                  </>
                )}

                {canReview && (
                  <StatCard
                    label="Awaiting review"
                    value={
                      statsLoading
                        ? "…"
                        : String(stats.awaitingReview)
                    }
                    description="Exercise submissions in the review queue"
                  />
                )}

                {!canContribute && !canReview && (
                  <StatCard
                    label="Learning platform"
                    value="Active"
                    description="Your account has learner access"
                  />
                )}
              </div>

              {statsError && (
                <p role="alert" className="mt-4 text-sm text-red-700">
                  {statsError}
                </p>
              )}

              <div className="mt-8 grid gap-6 lg:grid-cols-2">
                <RecentContent />
                <AccessRoles roles={user.roles} />
              </div>

              {canContribute && (
                <div className="mt-6">
                  <ContentAccess
                    authorizations={authorizations}
                    loading={authorizationsLoading}
                    error={authorizationsError}
                  />
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}