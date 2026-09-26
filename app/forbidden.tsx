 'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function Forbidden() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0F1712] p-4 font-body md:p-8">
      <div className="relative w-full max-w-4xl overflow-hidden rounded-3xl border border-[#26332B] bg-[#17221C] p-10 md:p-14">
        <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-2">
          {/* COPY */}
          <div className="space-y-5">
            <span className="text-[12.5px] font-medium text-[#7C8A82]">
              Access restricted.
            </span>

            {/* FIX: Ibalot sa curly braces ang text na may ' o apostrophe para 100% safe sa build */}
            <h1 className="font-display text-[32px] font-bold leading-tight tracking-tight text-white md:text-[38px]">
              {"You don't have permission to view this page."}
            </h1>

            <p className="max-w-sm text-[13.5px] leading-relaxed text-[#A7B1AB]">
              If you think this is a mistake, contact your admin or go back home.
            </p>

            <div className="pt-2">
              <button
                onClick={() => router.back()}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-[13px] font-semibold text-[#17221C] transition-colors hover:bg-white/90"
              >
                <ArrowLeft size={15} strokeWidth={2} />
                Go back
              </button>
            </div>
          </div>

          {/* ILLUSTRATION */}
          <div className="relative hidden h-[260px] items-center justify-center md:flex">
            <svg viewBox="0 0 320 260" className="h-full w-full" aria-hidden="true">
              <defs>
                <linearGradient id="circleBg" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#EAF6EF" />
                  <stop offset="100%" stopColor="#BFE3CE" />
                </linearGradient>
                <linearGradient id="cubeTop" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="100%" stopColor="#EAF6EF" />
                </linearGradient>
                <linearGradient id="badge" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#5CAE82" />
                  <stop offset="100%" stopColor="#3E8F68" />
                </linearGradient>
              </defs>

              {/* Backdrop circle */}
              <circle cx="160" cy="140" r="90" fill="url(#circleBg)" />

              {/* Isometric cube — access denied to "the box" */}
              <polygon points="160,50 210,80 160,110 110,80" fill="url(#cubeTop)" />
              <polygon points="110,80 160,110 160,180 110,150" fill="#BFE3CE" />
              <polygon points="210,80 160,110 160,180 210,150" fill="#9BCDB0" />

              {/* Search badge, overlapping the cube's base */}
              <circle cx="163" cy="176" r="42" fill="url(#badge)" />
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
