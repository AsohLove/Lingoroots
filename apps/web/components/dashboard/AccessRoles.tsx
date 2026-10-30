import type { Role } from '../../types/auth';

type AccessRolesProps = {
  roles: Role[];
};

export default function AccessRoles({
  roles,
}: AccessRolesProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="font-semibold text-slate-900">
        Your roles
      </h3>

      <p className="mt-1 text-sm text-slate-500">
        Permissions assigned to your account.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {roles.map((role) => (
          <span
            key={role}
            className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700"
          >
            {role}
          </span>
        ))}
      </div>
    </section>
  );
}