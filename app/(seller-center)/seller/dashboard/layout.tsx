 // app/(seller-center)/seller/dashboard/layout.tsx
import React from "react";

export default function DashboardBaseExternalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full min-h-screen antialiased bg-slate-50 text-black">
      {children}
    </div>
  );
}
