"use client";

import { useQuery } from "@tanstack/react-query";

interface AppSettings {
  electricityRateKwh: number | null;
  printerWattage: number | null;
  laborRatePerHour: number | null;
  defaultPlatformFee: number | null;
}

async function fetchSettings(): Promise<AppSettings | null> {
  const res = await fetch("/api/settings");
  if (!res.ok) throw new Error("Failed to fetch settings");
  const json = await res.json();
  return json.data ?? null;
}

export function useSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: fetchSettings,
  });
}
