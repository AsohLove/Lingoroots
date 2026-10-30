import NavItem from './NavItem';

type DashboardSidebarProps = {
  activePage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
};

export default function DashboardSidebar({
  activePage,
  onNavigate,
  onLogout,
}: DashboardSidebarProps) {
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
          <NavItem
            label="Dashboard"
            active={activePage === 'Dashboard'}
            onClick={() => onNavigate('Dashboard')}
          />

          <NavItem
            label="Content"
            active={activePage === 'Content'}
            onClick={() => onNavigate('Content')}
          />

          <NavItem
            label="Languages"
            active={activePage === 'Languages'}
            onClick={() => onNavigate('Languages')}
          />

          <NavItem
            label="Courses"
            active={activePage === 'Courses'}
            onClick={() => onNavigate('Courses')}
          />

          <NavItem
            label="Lessons"
            active={activePage === 'Lessons'}
            onClick={() => onNavigate('Lessons')}
          />

          <NavItem
            label="Reviews"
            active={activePage === 'Reviews'}
            onClick={() => onNavigate('Reviews')}
          />

          <NavItem
            label="Submissions"
            active={activePage === 'Submissions'}
            onClick={() => onNavigate('Submissions')}
          />

          <NavItem
            label="Settings"
            active={activePage === 'Settings'}
            onClick={() => onNavigate('Settings')}
          />
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