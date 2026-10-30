type Lesson = {
  id: string;
  name: string;
};

type LessonSelectorProps = {
  lessons: Lesson[];
  value: string;
  onChange: (lessonId: string) => void;
  loading: boolean;
};

export default function LessonSelector({
  lessons,
  value,
  onChange,
  loading,
}: LessonSelectorProps) {
  return (
    <div>
      <label
        htmlFor="lesson"
        className="mb-2 block text-sm font-medium text-slate-700"
      >
        Lesson
      </label>

      <select
        id="lesson"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={loading || lessons.length === 0}
        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none disabled:cursor-not-allowed disabled:bg-slate-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
      >
        <option value="">
          {loading ? 'Loading lessons...' : 'Select a lesson'}
        </option>

        {lessons.map((lesson) => (
          <option key={lesson.id} value={lesson.id}>
            {lesson.name}
          </option>
        ))}
      </select>
    </div>
  );
}