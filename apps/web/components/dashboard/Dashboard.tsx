"use client";

import { useEffect, useState } from "react";

import type { AuthenticatedUser } from "../../types/auth";
import type { LanguageAuthorization } from "../../types/authorization";

import { getMyAuthorizations } from "../../lib/authorizations";
import { logout } from "../../lib/auth";

import DashboardHeader from "./DashboardHeader";
import DashboardSidebar from "./DashboardSidebar";
import StatCard from "./StatCard";
import RecentContent from "./RecentContent";
import AccessRoles from "./AccessRoles";
import ContentAccess from "./ContentAccess";

type DashboardProps = {
  user: AuthenticatedUser;
  onLogout: () => void;
};

export default function Dashboard({ user, onLogout }: DashboardProps) {
  const [activePage, setActivePage] = useState("Dashboard");

  const [authorizations, setAuthorizations] = useState<LanguageAuthorization[]>(
    [],
  );

  const [authorizationsLoading, setAuthorizationsLoading] = useState(true);

  const [authorizationsError, setAuthorizationsError] = useState<string | null>(
    null,
  );

  useEffect(() => {
    async function loadAuthorizations() {
      try {
        setAuthorizationsLoading(true);
        setAuthorizationsError(null);

        const data = await getMyAuthorizations();

        setAuthorizations(data);
      } catch (error) {
        setAuthorizationsError(
          error instanceof Error
            ? error.message
            : "Failed to load content access.",
        );
      } finally {
        setAuthorizationsLoading(false);
      }
    }

    loadAuthorizations();
  }, []);

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
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardHeader user={user} />

        <main className="flex-1 p-8">
          {activePage !== "Dashboard" ? (
            <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900">
                {activePage}
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                This section will be implemented in a later vertical slice.
              </p>
            </div>
          ) : (
            <>
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                  label="Languages"
                  value="1"
                  description="Languages currently available"
                />

                <StatCard
                  label="Courses"
                  value="1"
                  description="Courses currently available"
                />

                <StatCard
                  label="Drafts"
                  value="0"
                  description="Content awaiting submission"
                />

                <StatCard
                  label="Reviews"
                  value="0"
                  description="Items currently awaiting review"
                />
              </div>

              <div className="mt-8 grid gap-6 lg:grid-cols-2">
                <RecentContent />

                <AccessRoles roles={user.roles} />
              </div>

              <div className="mt-6">
                <ContentAccess
                  authorizations={authorizations}
                  loading={authorizationsLoading}
                  error={authorizationsError}
                />
              </div>

              <div className="mt-6 rounded-xl bg-indigo-600 p-6 text-white">
                <h3 className="font-semibold">Next step</h3>

                <p className="mt-1 text-sm text-indigo-100">
                  Build the content workspace for creating and managing language
                  content within your authorized scope.
                </p>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
