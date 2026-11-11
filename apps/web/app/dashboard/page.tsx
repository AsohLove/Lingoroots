
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import Dashboard from '../../components/dashboard/Dashboard';
import { getCurrentUser } from '../../lib/auth';
import type { AuthenticatedUser } from '../../types/auth';

export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadUser() {
      try {
        const currentUser = await getCurrentUser();

        if (!cancelled) {
          setUser(currentUser);
        }
      } catch {
        if (!cancelled) {
          router.replace('/login');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadUser();

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <p className="text-sm text-slate-400">
          Loading your workspace...
        </p>
      </div>
    );
  }

  return (
    <Dashboard
      user={user}
      onLogout={() => {
        setUser(null);
        router.replace('/');
      }}
    />
  );
}
