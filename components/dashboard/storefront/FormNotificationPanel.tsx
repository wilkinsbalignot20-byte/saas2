// components/dashboard/storefront/FormNotificationPanel.tsx
'use client';

import { AlertCircle, Sparkles } from 'lucide-react';

interface FormNotificationPanelProps {
  error: string;
  success: string;
}

export default function FormNotificationPanel({ error, success }: FormNotificationPanelProps) {
  return (
    <div className="space-y-4">
      {/* ERROR PANEL */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-3 text-sm animate-in fade-in slide-in-from-top-2 duration-200">
          <AlertCircle size={18} className="shrink-0 text-rose-500" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* SUCCESS PANEL */}
      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl flex items-center gap-3 text-sm animate-in fade-in slide-in-from-top-2 duration-200">
          <Sparkles size={18} className="shrink-0 text-emerald-600" />
          <span className="font-medium">{success}</span>
        </div>
      )}
    </div>
  );
}
