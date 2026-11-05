type Unit = {
  id: string;
  name: string;
};

type UnitSelectorProps = {
  units: Unit[];
  value: string;
  onChange: (unitId: string) => void;
  loading: boolean;
};

export default function UnitSelector({
  units,
  value,
  onChange,
  loading,
}: UnitSelectorProps) {
  return (
    <div>
      <label
        htmlFor="unit"
        className="mb-2 block text-sm font-medium text-slate-700"
      >
        Unit
      </label>

      <select
        id="unit"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={loading || units.length === 0}
        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none disabled:cursor-not-allowed disabled:bg-slate-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
      >
        <option value="">
          {loading ? 'Loading units...' : 'Select a unit'}
        </option>

        {units.map((unit) => (
          <option key={unit.id} value={unit.id}>
            {unit.name}
          </option>
        ))}
      </select>
    </div>
  );
}