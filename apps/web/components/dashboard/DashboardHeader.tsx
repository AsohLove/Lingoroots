import type { AuthenticatedUser } from '../../types/auth';

type DashboardHeaderProps = {
  user: AuthenticatedUser;
};

export default function DashboardHeader({
  user,
}: DashboardHeaderProps) {
  const primaryRole = user.roles[0] ?? 'LEARNER';

  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-8 py-5">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">
          Dashboard
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Manage your LingoRoots workspace.
        </p>
      </div>

      <div className="text-right">
        <p className="text-sm font-medium text-slate-900">
          {user.name}
        </p>

        <p className="text-xs text-slate-500">
          {primaryRole}
        </p>
      </div>
    </header>
  );
}