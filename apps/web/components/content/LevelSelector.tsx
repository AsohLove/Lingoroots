type Level = {
  id: string;
  code: string;
  name: string;
};

type LevelSelectorProps = {
  levels: Level[];
  value: string;
  onChange: (levelId: string) => void;
  loading: boolean;
};

export default function LevelSelector({
  levels,
  value,
  onChange,
  loading,
}: LevelSelectorProps) {
  return (
    <div>
      <label
        htmlFor="level"
        className="mb-2 block text-sm font-medium text-slate-700"
      >
        Level
      </label>

      <select
        id="level"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={loading || levels.length === 0}
        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none disabled:cursor-not-allowed disabled:bg-slate-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
      >
        <option value="">
          {loading ? 'Loading levels...' : 'Select a level'}
        </option>

        {levels.map((level) => (
          <option key={level.id} value={level.id}>
            {level.code} — {level.name}
          </option>
        ))}
      </select>
    </div>
  );
}