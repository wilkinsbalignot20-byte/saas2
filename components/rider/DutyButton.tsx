import { Navigation, Power } from "lucide-react";

type Props = {
  onDuty: boolean;
  onClick: () => void;
};

export function DutyButton({ onDuty, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={onDuty}
      className={`flex h-16 w-full items-center justify-center gap-3 rounded-2xl text-base font-extrabold transition-transform active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/40 ${
        onDuty
          ? "bg-[#F4513F] text-white"
          : "bg-[#FFC83D] text-[#0E1B2C]"
      }`}
    >
      {onDuty ? <Power size={22} aria-hidden /> : <Navigation size={22} aria-hidden />}
      {onDuty ? "Go off duty" : "Go on duty"}
    </button>
  );
}