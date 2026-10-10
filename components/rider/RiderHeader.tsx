import { Bike } from "lucide-react";

type Props = {
  name: string;
  vehicle: string;
  onDuty: boolean;
};

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function RiderHeader({ name, vehicle, onDuty }: Props) {
  return (
    <header className="flex items-center gap-3">
      <div
        aria-hidden
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#FFC83D] text-base font-extrabold text-[#0E1B2C]"
      >
        {initials(name)}
      </div>

      <div className="min-w-0 flex-1">
        <h1 className="truncate text-lg font-bold leading-tight">{name}</h1>
        <p className="flex items-center gap-1.5 text-sm text-slate-400">
          <Bike size={14} aria-hidden />
          {vehicle}
        </p>
      </div>

      <span
        className={`rounded-full px-3 py-1.5 text-xs font-bold ${
          onDuty
            ? "bg-emerald-400/15 text-emerald-300"
            : "bg-slate-500/20 text-slate-400"
        }`}
      >
        {onDuty ? "On duty" : "Off duty"}
      </span>
    </header>
  );
}