"use client";

import { useEffect, useState } from "react";
import type { RiderPosition, SyncState, TrackingStatus } from "@/hook/useLiveTracking";

type Props = {
  status: TrackingStatus;
  position: RiderPosition | null;
  syncState: SyncState;
  lastSyncAt: number | null;
  startedAt: number | null;
};

function useNow(enabled: boolean) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!enabled) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [enabled]);
  return now;
}

function formatDuration(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = String(Math.floor(total / 3600)).padStart(2, "0");
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
  const s = String(total % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

function formatAgo(ms: number) {
  const s = Math.floor(ms / 1000);
  if (s < 5) return "Ngayon lang";
  if (s < 60) return `${s}s ago`;
  return `${Math.floor(s / 60)}m ago`;
}

const STATUS_COPY: Record<TrackingStatus, { label: string; dot: string }> = {
  off: { label: "Hindi pa naka-duty", dot: "bg-slate-500" },
  starting: { label: "Hinahanap ang GPS…", dot: "bg-amber-300 animate-pulse" },
  live: { label: "Live ang location mo", dot: "bg-emerald-400 animate-pulse" },
};

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-[#0E1B2C] px-3 py-3">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-1 text-base font-bold tabular-nums">{value}</p>
    </div>
  );
}

export function TrackingPanel({ status, position, syncState, lastSyncAt, startedAt }: Props) {
  const now = useNow(status !== "off");
  const copy = STATUS_COPY[status];

  const speedKmh =
    position?.speed != null ? `${Math.round(position.speed * 3.6)} km/h` : "—";
  const accuracy = position ? `±${Math.round(position.accuracy)} m` : "—";
  const synced = lastSyncAt ? formatAgo(now - lastSyncAt) : "—";

  return (
    <section
      aria-live="polite"
      className="rounded-3xl bg-[#15283F] p-5"
    >
      <p className="flex items-center gap-2.5 text-sm font-semibold">
        <span className={`h-2.5 w-2.5 rounded-full ${copy.dot}`} aria-hidden />
        {copy.label}
      </p>

      {status === "off" ? (
        <p className="mt-4 text-sm leading-relaxed text-slate-400">
          Pindutin ang <span className="font-semibold text-slate-200">Go on duty</span> para makita
          ng store at ng customer kung nasaan ka habang nagde-deliver.
        </p>
      ) : (
        <>
          <div className="mt-5">
            <p className="text-5xl font-extrabold tabular-nums tracking-tight">
              {startedAt ? formatDuration(now - startedAt) : "00:00:00"}
            </p>
            <p className="mt-1 text-sm text-slate-400">Oras sa duty</p>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2">
            <Stat label="Bilis" value={speedKmh} />
            <Stat label="Accuracy" value={accuracy} />
            <Stat label="Huling sync" value={synced} />
          </div>

          {syncState === "failed" && (
            <p className="mt-4 text-sm text-amber-300">
              Hindi maipadala ang location. Check ang internet — susubukan ulit.
            </p>
          )}
        </>
      )}
    </section>
  );
}