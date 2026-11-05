import type { LanguageAuthorization } from "../../types/authorization";

type ContentAccessProps = {
  authorizations: LanguageAuthorization[];
  loading: boolean;
  error: string | null;
};

export default function ContentAccess({
  authorizations,
  loading,
  error,
}: ContentAccessProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <h3 className="font-semibold text-slate-900">Your content access</h3>

        <p className="mt-1 text-sm text-slate-500">
          Languages and variants you are authorized to work with.
        </p>
      </div>

      {loading && (
        <p className="mt-6 text-sm text-slate-500">
          Loading your content access...
        </p>
      )}

      {error && (
        <div className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && authorizations.length === 0 && (
        <div className="mt-6 rounded-lg bg-slate-50 px-4 py-5">
          <p className="text-sm font-medium text-slate-700">
            No content access assigned
          </p>

          <p className="mt-1 text-sm text-slate-500">
            You currently do not have authorization to manage language content.
          </p>
        </div>
      )}

      {!loading && !error && authorizations.length > 0 && (
        <div className="mt-6 space-y-3">
          {authorizations.map((authorization) => (
            <div
              key={authorization.id}
              className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-4"
            >
              <div>
                <p className="font-medium text-slate-900">
                  {authorization.language.name}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {authorization.variant
                    ? authorization.variant.name
                    : "All variants"}
                </p>
              </div>

              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                Authorized
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
