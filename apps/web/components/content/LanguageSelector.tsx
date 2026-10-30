import type { LanguageAuthorization } from '../../types/authorization';

type LanguageSelectorProps = {
  authorizations: LanguageAuthorization[];
  value: string;
  onChange: (languageId: string) => void;
};

export default function LanguageSelector({
  authorizations,
  value,
  onChange,
}: LanguageSelectorProps) {
  const languages = Array.from(
    new Map(
      authorizations.map((authorization) => [
        authorization.language.id,
        authorization.language,
      ]),
    ).values(),
  );

  return (
    <div>
      <label
        htmlFor="language"
        className="mb-2 block text-sm font-medium text-slate-700"
      >
        Language
      </label>

      <select
        id="language"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
      >
        <option value="">Select a language</option>

        {languages.map((language) => (
          <option key={language.id} value={language.id}>
            {language.name}
          </option>
        ))}
      </select>
    </div>
  );
}