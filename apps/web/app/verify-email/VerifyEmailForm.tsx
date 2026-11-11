
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import { resendVerification, verifyEmail } from '../../lib/auth';

export default function VerifyEmailForm() {
  const router = useRouter();

  const [code, setCode] = useState('');
  const [secondsRemaining, setSecondsRemaining] = useState(60);

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const email = searchParams.get('email') ?? '';

  useEffect(() => {
    if (secondsRemaining <= 0) return;

    const timer = window.setTimeout(() => {
      setSecondsRemaining((remaining) => remaining - 1);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [secondsRemaining]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setNotice(null);

    if (!email) {
      setError('Your email address is missing. Please register again.');
      return;
    }

    if (!/^\d{6}$/.test(code)) {
      setError('Enter the six-digit verification code.');
      return;
    }

    setLoading(true);

    try {
      await verifyEmail(email, code);
      router.replace('/dashboard');
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Unable to verify your email address.',
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (!email || secondsRemaining > 0) return;

    setError(null);
    setNotice(null);
    setResending(true);

    try {
      const result = await resendVerification(email);

      setNotice(result.message);
      setSecondsRemaining(60);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Unable to resend the verification code.',
      );
    } finally {
      setResending(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-12">
      <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-2xl sm:p-10">
        <Link href="/" className="text-sm font-semibold text-indigo-600">
          ← LingoRoots
        </Link>

        <h1 className="mt-8 text-3xl font-bold text-slate-900">
          Verify your email
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-500">
          Enter the six-digit code sent to your email address.
          The code expires after 10 minutes.
        </p>

        {email && (
          <p className="mt-4 rounded-lg bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
            {email}
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label htmlFor="code" className="mb-2 block text-sm font-medium text-slate-700">
              Verification code
            </label>
            <input
              id="code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6}"
              maxLength={6}
              value={code}
              onChange={(event) =>
                setCode(event.target.value.replace(/\D/g, '').slice(0, 6))
              }
              required
              className="w-full rounded-lg border border-slate-300 px-4 py-4 text-center text-2xl font-bold tracking-[0.5em] text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              placeholder="000000"
            />
          </div>

          {error && (
            <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}

          {notice && (
            <p role="status" className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
              {notice}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !email}
            className="w-full rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Verifying...' : 'Verify email'}
          </button>
        </form>

        <div className="mt-7 border-t border-slate-200 pt-6 text-center">
          <p className="text-sm text-slate-500">
            Didn&apos;t receive the code?
          </p>

          <button
            type="button"
            onClick={handleResend}
            disabled={!email || resending || secondsRemaining > 0}
            className="mt-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 disabled:cursor-not-allowed disabled:text-slate-400"
          >
            {resending
              ? 'Sending...'
              : secondsRemaining > 0
                ? `Resend available in ${secondsRemaining}s`
                : 'Resend verification code'}
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already verified?{' '}
          <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-700">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
