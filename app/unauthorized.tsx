// src/app/unauthorized.tsx
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function Unauthorized() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0F1712] p-4 font-body md:p-8">
      <div className="relative w-full max-w-4xl overflow-hidden rounded-3xl border border-[#26332B] bg-[#17221C] p-10 md:p-14">
        <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-2">
          {/* COPY */}
          <div className="space-y-5">
            <span className="text-[12.5px] font-medium text-[#7C8A82]">
              Looks like you're not signed in.
            </span>

            <h1 className="font-display text-[32px] font-bold leading-tight tracking-tight text-white md:text-[38px]">
              Please sign in to access this page.
            </h1>

            <p className="max-w-sm text-[13.5px] leading-relaxed text-[#A7B1AB]">
              It only takes a moment — we'll take you right back here after.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => router.back()}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-[13px] font-semibold text-[#17221C] transition-colors hover:bg-white/90"
              >
                <ArrowLeft size={15} strokeWidth={2} />
                Go back
              </button>
              <Link
                href="/login"
                className="rounded-xl px-4 py-2.5 text-[13px] font-semibold text-white transition-colors"
                style={{ backgroundColor: '#3E8F68' }}
              >
                Sign in
              </Link>
            </div>
          </div>

          {/* ILLUSTRATION */}
          <div className="relative hidden h-[260px] items-center justify-center md:flex">
            <svg viewBox="0 0 320 260" className="h-full w-full" aria-hidden="true">
              <defs>
                <linearGradient id="blob" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#EAF6EF" />
                  <stop offset="100%" stopColor="#BFE3CE" />
                </linearGradient>
                <linearGradient id="circle" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#5CAE82" />
                  <stop offset="100%" stopColor="#3E8F68" />
                </linearGradient>
              </defs>

              {/* Cloud-like blob */}
              <path
                d="M160 40c-46 0-83 33-90 76-3 0-6 0-8 0-27 0-49 22-49 49s22 49 49 49h190c27 0 49-22 49-49 0-25-19-46-44-49 1-4 2-9 2-13 0-40-40-113-99-113z"
                fill="url(#blob)"
              />

              {/* Accent circle with search icon */}
              <circle cx="163" cy="176" r="42" fill="url(#circle)" />
              <circle cx="155" cy="168" r="12" fill="none" stroke="white" strokeWidth="4" />
              <line x1="164" y1="177" x2="176" y2="189" stroke="white" strokeWidth="4" strokeLinecap="round" />

              {/* Scattered dots */}
              <circle cx="42" cy="70" r="7" fill="#3E8F68" opacity="0.9" />
              <circle cx="272" cy="58" r="9" fill="#EAF6EF" />
              <circle cx="296" cy="98" r="6" fill="#5CAE82" />
              <circle cx="30" cy="196" r="8" fill="#EAF6EF" />
              <circle cx="278" cy="210" r="6" fill="#3E8F68" opacity="0.8" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}