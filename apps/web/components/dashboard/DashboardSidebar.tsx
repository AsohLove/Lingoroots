import type { Role } from "../../types/auth";
import NavItem from "./NavItem";

type DashboardSidebarProps = {
  activePage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  roles: Role[];
};

export default function DashboardSidebar({
  activePage,
  onNavigate,
  onLogout,
  roles,
}: DashboardSidebarProps) {
  const isAdministrator = roles.includes("ADMINISTRATOR");
  const canContribute =
    isAdministrator || roles.includes("CONTRIBUTOR");
  const canReview = isAdministrator || roles.includes("REVIEWER");

  const navigation = [
    { label: "Dashboard", visible: true },
    { label: "Contributor applications", visible: true },
    { label: "Content", visible: canContribute },
    { label: "Submissions", visible: canContribute },
    { label: "Reviews", visible: canReview },
    { label: "Governance", visible: isAdministrator },
  ].filter((item) => item.visible);

  return (
    <aside className="flex w-64 flex-col bg-slate-950 text-white">
      <div className="border-b border-slate-800 px-6 py-6">
        <h1 className="text-xl font-bold">LingoRoots</h1>
        <p className="mt-1 text-sm text-slate-400">Content Platform</p>
      </div>

      <nav className="flex-1 px-3 py-6">
        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Workspace
        </p>

        <div className="space-y-1">
          {navigation.map((item) => (
            <NavItem
              key={item.label}
              label={item.label}
              active={activePage === item.label}
              onClick={() => onNavigate(item.label)}
            />
          ))}
        </div>
      </nav>

      <div className="border-t border-slate-800 p-4">
        <button
          type="button"
          onClick={onLogout}
          className="w-full rounded-lg px-3 py-2 text-left text-sm text-slate-400 transition hover:bg-slate-900 hover:text-white"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}