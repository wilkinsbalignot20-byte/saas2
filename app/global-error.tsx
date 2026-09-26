 'use client'; // REQUIRED: Root-level error boundaries must be Client Components

import { useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Idinagdag para sa ligtas na Client-side navigation
import { AlertTriangle, RotateCw } from 'lucide-react';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  const router = useRouter(); // I-initialize ang router

  useEffect(() => {
    // I-log ang fatal error para sa debugging
    console.error('Root-level application error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-[#0F1712] p-6 font-body">
        <div className="w-full max-w-md rounded-3xl border border-[#26332B] bg-[#17221C] p-8 text-center">
          {/* Error icon */}
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-500/10 text-rose-400">
            <AlertTriangle size={24} strokeWidth={1.75} />
          </div>

          <h2 className="font-display text-xl font-bold tracking-tight text-white">
            Something went wrong
          </h2>

          <p className="mt-2 text-[13.5px] leading-relaxed text-[#A7B1AB]">
            We hit an unexpected error loading the app. Try again, or head back home if it
            keeps happening.
          </p>

          {/* Error digest, kung meron */}
          {error.digest && (
            <p className="mt-3 inline-block rounded-md bg-[#1F2C24] px-2 py-1 font-mono text-[10px] text-[#7C8A82]">
              Error ID: {error.digest}
            </p>
          )}

          <div className="mt-6 flex flex-col gap-2">
            <button
              onClick={() => reset()}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-semibold text-white transition-all active:scale-[0.98]"
              style={{ backgroundColor: '#3E8F68' }}
            >
              <RotateCw size={14} strokeWidth={2} />
              Try again
            </button>

            {/* FIX: Pinalitan ang <a> tag ng <button> na may router.push('/') para sa mabilis at ligtas na client-side transition */}
            <button
              onClick={() => router.push('/')}
              className="inline-block w-full rounded-xl bg-white px-4 py-2.5 text-[13px] font-semibold text-[#17221C] transition-all hover:bg-white/90 text-center cursor-pointer"
            >
              Back to home
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
