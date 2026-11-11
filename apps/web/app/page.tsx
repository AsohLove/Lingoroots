
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 font-bold">
            LR
          </span>
          <span className="text-xl font-bold">LingoRoots</span>
        </Link>

        <nav className="flex items-center gap-3">
          <Link
            href="/login"
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-300 hover:text-white"
          >
            Sign in
          </Link>

          <Link
            href="/register"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold hover:bg-indigo-500"
          >
            Get started
          </Link>
        </nav>
      </header>

      <section className="mx-auto grid max-w-7xl gap-12 px-6 py-24 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="mb-5 text-sm font-semibold uppercase tracking-[0.2em] text-indigo-400">
            Language learning and preservation
          </p>

          <h1 className="max-w-2xl text-4xl font-bold leading-tight sm:text-6xl">
            Keep languages alive.
            <span className="text-indigo-400">
              {' '}Learn them. Share them.
            </span>
          </h1>

          <p className="mt-7 max-w-xl text-lg leading-8 text-slate-300">
            LingoRoots is a platform for learning and developing
            quality educational content for underrepresented
            languages, with a focus on African languages.
          </p>

          <div className="mt-9 flex flex-wrap gap-4">
            <Link
              href="/register"
              className="rounded-lg bg-indigo-600 px-6 py-3 font-semibold hover:bg-indigo-500"
            >
              Create your account
            </Link>

            <Link
              href="/login"
              className="rounded-lg border border-slate-700 px-6 py-3 font-semibold hover:bg-slate-800"
            >
              Sign in
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 sm:p-10">
          <h2 className="text-2xl font-bold">
            What is LingoRoots?
          </h2>

          <div className="mt-8 space-y-7">
            <div>
              <h3 className="font-semibold text-indigo-300">
                Learn languages
              </h3>
              <p className="mt-2 leading-7 text-slate-400">
                Access structured language-learning content
                organized into courses, levels, units and lessons.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-indigo-300">
                Contribute knowledge
              </h3>
              <p className="mt-2 leading-7 text-slate-400">
                Verified language contributors can help develop
                vocabulary and learning exercises.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-indigo-300">
                Review learning content
              </h3>
              <p className="mt-2 leading-7 text-slate-400">
                Reviewers help ensure submitted educational
                content meets quality requirements before publication.
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-800 px-6 py-8 text-center text-sm text-slate-500">
        LingoRoots — Supporting languages and the communities
        that keep them alive.
      </footer>
    </main>
  );
}
