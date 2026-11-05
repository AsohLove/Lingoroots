type NavItemProps = {
  label: string;
  active: boolean;
  onClick: () => void;
};

export default function NavItem({ label, active, onClick }: NavItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium transition ${
        active
          ? "bg-indigo-600 text-white"
          : "text-slate-400 hover:bg-slate-900 hover:text-white"
      }`}
    >
      {label}
    </button>
  );
}
