 // components/dashboard/logistics/dispatch/NoRidersBanner.tsx
"use client";

import { UserPlus } from "lucide-react";
import { btnSecondary } from "@/components/dashboard/marketing/shared";
import Link from "next/link"; 

// Wala nang anumang props dito kaya hinding-hindi na mag-eerror si Next.js!
export default function NoRidersBanner() {
  return (
    <div className="mx-4 mt-4 flex flex-col gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 sm:mx-5 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-amber-900">
        You haven&apos;t added any riders yet. Add at least one rider so you can assign orders.
      </p>
      
      {/* Gagamit tayo ng Link. Baguhin ang href patungo sa tamang route path ng iyong dashboard logistics kung kailangan */}
      <Link href="?tab=riders" className={`${btnSecondary} shrink-0`}>
        <UserPlus size={16} /> Add a rider
      </Link>
    </div>
  );
}
