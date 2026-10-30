'use client';

import { FormEvent, useEffect, useState } from 'react';
import { getCurrentUser, login, logout } from '../lib/auth';
import type { AuthenticatedUser } from '../types/auth';

export default function Home() {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentUser()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-indigo-400" />
          <p className="mt-4 text-sm text-slate-400">
            Loading LingoRoots...
          </p>
        </div>
      </main>
    );
  }

  if (!user) {
    return <LoginScreen onLogin={setUser} />;
  }

  return <Dashboard user={user} onLogout={() => setUser(null)} />;
}

type LoginScreenProps = {
  onLogin: (user: AuthenticatedUser) => void;
};

function LoginScreen({ onLogin }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError(null);
    setSubmitting(true);

    try {
      await login(email, password);

      const authenticatedUser = await getCurrentUser();

      onLogin(authenticatedUser);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Unable to log in',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-12">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl lg:grid-cols-2">

        {/* Brand panel */}
        <section className="relative hidden overflow-hidden bg-indigo-700 p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-indigo-500/40" />
          <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-indigo-900/40" />

          <div className="relative">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-lg font-bold">
                L
              </div>

              <span className="text-lg font-semibold">
                LingoRoots
              </span>
            </div>

            <div className="mt-20 max-w-md">
              <p className="text-sm font-semibold uppercase tracking-widest text-indigo-200">
                Management Platform
              </p>

              <h1 className="mt-4 text-4xl font-bold leading-tight">
                Build better learning experiences for African languages.
              </h1>

              <p className="mt-6 leading-7 text-indigo-100">
                Create, review, and manage structured language-learning
                content for the LingoRoots platform.
              </p>
            </div>
          </div>

          <p className="relative text-sm text-indigo-200">
            Content management • Review • Publishing
          </p>
        </section>

        {/* Login form */}
        <section className="flex items-center p-8 sm:p-12">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <p className="text-sm font-semibold text-indigo-600">
                Welcome back
              </p>

              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                Sign in to your account
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                Access the LingoRoots management platform.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Email address
                </label>

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Password
                </label>

                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                />
              </div>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            <p className="mt-8 text-center text-xs text-slate-400">
              LingoRoots Management Platform
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

type DashboardProps = {
  user: AuthenticatedUser;
  onLogout: () => void;
};

function Dashboard({ user, onLogout }: DashboardProps) {
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);

    try {
      await logout();
      onLogout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setLoggingOut(false);
    }
  }

  const primaryRole = user.roles[0] ?? 'LEARNER';

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="flex min-h-screen">

        {/* Sidebar */}
        <aside className="hidden w-64 flex-col bg-slate-950 text-white lg:flex">
          <div className="flex h-20 items-center border-b border-white/10 px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 font-bold">
                L
              </div>

              <div>
                <p className="font-semibold">LingoRoots</p>
                <p className="text-xs text-slate-400">Management</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-4 py-6">
            <p className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Workspace
            </p>

            <div className="mt-3 space-y-1">
              <NavItem active label="Dashboard" />
              <NavItem label="Content" />
              <NavItem label="Languages" />
              <NavItem label="Courses" />
              <NavItem label="Lessons" />
            </div>

            <p className="mt-8 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Workflow
            </p>

            <div className="mt-3 space-y-1">
              <NavItem label="Reviews" />
              <NavItem label="Submissions" />
            </div>

            <p className="mt-8 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
              System
            </p>

            <div className="mt-3 space-y-1">
              <NavItem label="Settings" />
            </div>
          </nav>

          <div className="border-t border-white/10 p-4">
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex w-full items-center rounded-xl px-3 py-3 text-sm text-slate-400 transition hover:bg-white/5 hover:text-white disabled:opacity-50"
            >
              <span className="mr-3">↪</span>
              {loggingOut ? 'Signing out...' : 'Sign out'}
            </button>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Top bar */}
          <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-6 sm:px-8">
            <div>
              <p className="text-sm text-slate-500">
                Management workspace
              </p>
              <p className="font-semibold text-slate-900">
                Content & Curriculum
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold text-slate-900">
                  {user.name}
                </p>

                <p className="text-xs text-slate-500">
                  {primaryRole}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-700">
                {user.name.charAt(0).toUpperCase()}
              </div>
            </div>
          </header>

          <div className="flex-1 p-6 sm:p-8">
            <div className="mx-auto max-w-7xl">

              {/* Welcome */}
              <section>
                <p className="text-sm font-medium text-indigo-600">
                  Overview
                </p>

                <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
                  Good to see you, {user.name.split(' ')[0]}.
                </h1>

                <p className="mt-2 text-slate-500">
                  Here is what&apos;s happening across your workspace.
                </p>
              </section>

              {/* Stats */}
              <section className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                  label="Languages"
                  value="1"
                  description="Available languages"
                />

                <StatCard
                  label="Courses"
                  value="1"
                  description="Active courses"
                />

                <StatCard
                  label="Drafts"
                  value="0"
                  description="Awaiting submission"
                />

                <StatCard
                  label="Reviews"
                  value="0"
                  description="Awaiting your review"
                />
              </section>

              {/* Main dashboard grid */}
              <section className="mt-8 grid gap-6 xl:grid-cols-3">

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-semibold text-slate-900">
                        Recent content
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                        Your latest language-learning work.
                      </p>
                    </div>

                    <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">
                      View all
                    </button>
                  </div>

                  <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-xl text-indigo-600">
                      +
                    </div>

                    <h3 className="mt-4 font-semibold text-slate-900">
                      No recent content
                    </h3>

                    <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                      Content created through the management platform
                      will appear here.
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h2 className="font-semibold text-slate-900">
                    Your access
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Permissions assigned to your account.
                  </p>

                  <div className="mt-6 space-y-3">
                    {user.roles.map((role) => (
                      <div
                        key={role}
                        className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"
                      >
                        <span className="text-sm font-medium text-slate-700">
                          {role}
                        </span>

                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Quick actions */}
              <section className="mt-6 rounded-2xl bg-indigo-600 p-6 text-white shadow-sm sm:p-8">
                <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
                  <div>
                    <p className="text-sm font-medium text-indigo-200">
                      Next step
                    </p>

                    <h2 className="mt-1 text-xl font-semibold">
                      Start managing your language content
                    </h2>

                    <p className="mt-2 max-w-xl text-sm leading-6 text-indigo-100">
                      Create and manage courses, lessons, vocabulary,
                      expressions, and other learning content.
                    </p>
                  </div>

                  <button className="shrink-0 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-indigo-700 shadow-sm transition hover:bg-indigo-50">
                    Manage content
                  </button>
                </div>
              </section>

            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function NavItem({
  label,
  active = false,
}: {
  label: string;
  active?: boolean;
}) {
  return (
    <button
      className={`flex w-full items-center rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${
        active
          ? 'bg-indigo-600 text-white'
          : 'text-slate-400 hover:bg-white/5 hover:text-white'
      }`}
    >
      <span className="mr-3 h-2 w-2 rounded-full bg-current opacity-70" />
      {label}
    </button>
  );
}

function StatCard({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">
        {label}
      </p>

      <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-400">
        {description}
      </p>
    </div>
  );
}