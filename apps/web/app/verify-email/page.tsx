
import { Suspense } from 'react';
import VerifyEmailForm from './VerifyEmailForm';

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6">
          <p className="text-white">Loading verification...</p>
        </main>
      }
    >
      <VerifyEmailForm />
    </Suspense>
  );
}