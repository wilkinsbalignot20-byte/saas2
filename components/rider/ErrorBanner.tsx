import { AlertTriangle } from "lucide-react";

export function ErrorBanner({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm leading-snug text-amber-100"
    >
      <AlertTriangle size={20} className="mt-0.5 shrink-0 text-amber-300" aria-hidden />
      <p>{message}</p>
    </div>
  );
}