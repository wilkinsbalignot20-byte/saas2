 "use client";

import { use } from "react";
import { RiderHeader } from "@/components/rider/RiderHeader";
import { TrackingPanel } from "@/components/rider/TrackingPanel";
import { ErrorBanner } from "@/components/rider/ErrorBanner";
import { DutyButton } from "@/components/rider/DutyButton";
import { useLiveTracking } from "@/hook/useLiveTracking";

type RiderPageProps = { params: Promise<{ courierId: string }> };

// TODO: palitan ng data galing sa API/Supabase kapag ready na
const STORE_SLUG = "kins";
const RIDER = { name: "William Castro", vehicle: "Motorcycle" };

export default function RiderMobilePage({ params }: RiderPageProps) {
  const { courierId } = use(params);

  const { status, position, syncState, lastSyncAt, startedAt, error, start, stop } =
    useLiveTracking({ storeSlug: STORE_SLUG, courierId });

  const onDuty = status !== "off";

  return (
    <div className="min-h-dvh bg-[#07101C]">
      <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-[#0E1B2C] px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.25rem,env(safe-area-inset-top))] text-white">
        <RiderHeader name={RIDER.name} vehicle={RIDER.vehicle} onDuty={onDuty} />

        <div className="mt-6 flex flex-1 flex-col gap-4">
          {error && <ErrorBanner message={error} />}
          <TrackingPanel
            status={status}
            position={position}
            syncState={syncState}
            lastSyncAt={lastSyncAt}
            startedAt={startedAt}
          />
        </div>

        <div className="mt-6 space-y-3">
          <p className="text-center text-xs text-slate-500">
            Para sa kaligtasan, huwag hawakan ang phone habang nagmamaneho.
          </p>
          <DutyButton onDuty={onDuty} onClick={onDuty ? stop : start} />
        </div>
      </main>
    </div>
  );
}