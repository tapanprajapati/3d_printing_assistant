"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { SettingsInput } from "@/lib/validations/settings";

interface AppSettings {
  id: string;
  electricityRateKwh: number;
  printerWattage: number;
  laborRatePerHour: number;
  defaultPlatformFee: number;
  currencySymbol: string;
  lowStockThresholdG: number;
  updatedAt: string;
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

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: SettingsInput) => {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to save settings");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });
}
