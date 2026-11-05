'use client';

import { useEffect, useState } from 'react';

import Dashboard from '../components/dashboard/Dashboard';
import { getCurrentUser, login } from '../lib/auth';
import type { AuthenticatedUser } from '../types/auth';

type LoginScreenProps = {
  onLogin: (user: AuthenticatedUser) => void;
};

function LoginScreen({ onLogin }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setLoading(true);
    setError(null);

    try {
      const result = await login(email, password);

      const currentUser = await getCurrentUser();

      onLogin({
        ...currentUser,
        ...result.user,
      });
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Unable to sign in.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-12">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl lg:grid-cols-2">
        <div className="hidden bg-indigo-600 p-12 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-xl font-bold">
              LR
            </div>

            <h1 className="text-4xl font-bold leading-tight">
              Build better learning experiences for
              underrepresented languages.
            </h1>

            <p className="mt-6 max-w-md text-lg leading-8 text-indigo-100">
              LingoRoots gives language contributors and reviewers
              the tools to create, review, and publish high-quality
              learning content.
            </p>
          </div>

          <p className="text-sm text-indigo-200">
            LingoRoots Content Platform
          </p>
        </div>

        <div className="p-8 sm:p-12">
          <div className="mx-auto max-w-md">
            <div className="mb-8">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white lg:hidden">
                LR
              </div>

              <h2 className="text-2xl font-bold text-slate-900">
                Welcome back
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Sign in to your LingoRoots workspace.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Email
                </label>

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
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
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function Home() {
  const [user, setUser] =
    useState<AuthenticatedUser | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const currentUser = await getCurrentUser();

        setUser(currentUser);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <p className="text-sm text-slate-400">
          Loading...
        </p>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen onLogin={setUser} />;
  }

  return (
    <Dashboard
      user={user}
      onLogout={() => setUser(null)}
    />
  );
}