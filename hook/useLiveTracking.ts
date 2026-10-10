 "use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type TrackingStatus = "off" | "starting" | "live";
export type SyncState = "idle" | "ok" | "failed";
export type RiderPosition = {
  lat: number;
  lng: number;
  accuracy: number; // meters
  speed: number | null; // m/s
};

type Options = {
  storeSlug: string;
  courierId: string;
  /** Gaano kadalas mag-send sa server (ms). Default: 5s para tipid sa data at battery. */
  sendIntervalMs?: number;
};

export function useLiveTracking({
  storeSlug,
  courierId,
  sendIntervalMs = 5000,
}: Options) {
  const [status, setStatus] = useState<TrackingStatus>("off");
  const [position, setPosition] = useState<RiderPosition | null>(null);
  const [syncState, setSyncState] = useState<SyncState>("idle");
  const [lastSyncAt, setLastSyncAt] = useState<number | null>(null);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const lastSentRef = useRef(0);
  const active = status !== "off";

  const start = useCallback(() => {
    setError(null);
    if (!("geolocation" in navigator)) {
      setError("Hindi sinusuportahan ng browser na ito ang GPS. Subukan ang Chrome o Safari.");
      return;
    }
    setStatus("starting");
  }, []);

  const stop = useCallback(() => {
    setStatus("off");
    setPosition(null);
    setStartedAt(null);
    setSyncState("idle");
    lastSentRef.current = 0;
  }, []);

  // GPS watcher
  useEffect(() => {
    if (!active) return;

    const send = async (lat: number, lng: number) => {
      try {
        const res = await fetch(`/api/stores/${storeSlug}/couriers`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ courierId, latitude: lat, longitude: lng }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        setSyncState("ok");
        setLastSyncAt(Date.now());
      } catch {
        setSyncState("failed");
      }
    };

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, accuracy, speed } = pos.coords;
        setPosition({ lat: latitude, lng: longitude, accuracy, speed });
        setStatus("live");
        setStartedAt((prev) => prev ?? Date.now());
        setError(null);

        const now = Date.now();
        if (now - lastSentRef.current >= sendIntervalMs) {
          lastSentRef.current = now;
          void send(latitude, longitude);
        }
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setError("Naka-block ang location. Buksan ang Settings ng browser at i-allow ang Location para sa site na ito.");
          stop();
        } else {
          // Timeout o mahinang signal: hindi natin ititigil, magre-retry lang
          setError("Mahina ang GPS signal. Pumunta sa bukas na lugar — patuloy kaming sumusubok.");
        }
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [active, storeSlug, courierId, sendIntervalMs, stop]);

  // Pigilan ang screen na mag-sleep habang naka-duty
  useEffect(() => {
    if (!active) return;
    let lock: WakeLockSentinel | null = null;

    const acquire = async () => {
      try {
        lock = (await navigator.wakeLock?.request("screen")) ?? null;
      } catch {
        /* hindi suportado o tinanggihan — okay lang */
      }
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") void acquire();
    };

    void acquire();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      void lock?.release().catch(() => {});
    };
  }, [active]);

  return { status, position, syncState, lastSyncAt, startedAt, error, start, stop };
}