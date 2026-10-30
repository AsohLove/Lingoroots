export default function RecentContent() {
  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-6 py-5">
        <h3 className="font-semibold text-slate-900">
          Recent content
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          Your latest content activity will appear here.
        </p>
      </div>

      <div className="px-6 py-12 text-center">
        <p className="text-sm font-medium text-slate-700">
          No recent content
        </p>

        <p className="mt-1 text-sm text-slate-500">
          Content you create or edit will appear here.
        </p>
      </div>
    </section>
  );
}