type Course = {
  id: string;
  name: string;
};

type CourseSelectorProps = {
  courses: Course[];
  value: string;
  onChange: (courseId: string) => void;
  loading: boolean;
};

export default function CourseSelector({
  courses,
  value,
  onChange,
  loading,
}: CourseSelectorProps) {
  return (
    <div>
      <label
        htmlFor="course"
        className="mb-2 block text-sm font-medium text-slate-700"
      >
        Course
      </label>

      <select
        id="course"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={loading || courses.length === 0}
        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none disabled:cursor-not-allowed disabled:bg-slate-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
      >
        <option value="">
          {loading ? 'Loading courses...' : 'Select a course'}
        </option>

        {courses.map((course) => (
          <option key={course.id} value={course.id}>
            {course.name}
          </option>
        ))}
      </select>
    </div>
  );
}