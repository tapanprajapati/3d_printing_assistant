"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { FilamentInput, FilamentUpdateInput, UsageLogInput } from "@/lib/validations/filament";

async function fetchJson(url: string, options?: RequestInit) {
  const res = await fetch(url, options);
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(error.error ?? "Request failed");
  }
  return res.json();
}

// ─── Filaments ────────────────────────────────────────────────────────────────

export function useFilaments(filters?: { type?: string; lowStock?: boolean }) {
  const params = new URLSearchParams();
  if (filters?.type) params.set("type", filters.type);
  if (filters?.lowStock) params.set("lowStock", "true");
  const query = params.toString() ? `?${params.toString()}` : "";

  return useQuery({
    queryKey: ["filaments", filters],
    queryFn: () => fetchJson(`/api/filaments${query}`),
  });
}

export function useFilament(id: string) {
  return useQuery({
    queryKey: ["filament", id],
    queryFn: () => fetchJson(`/api/filaments/${id}`),
    enabled: !!id,
  });
}

export function useCreateFilament() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: FilamentInput) =>
      fetchJson("/api/filaments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["filaments"] });
    },
  });
}

export function useUpdateFilament() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: FilamentUpdateInput }) =>
      fetchJson(`/api/filaments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["filaments"] });
      queryClient.invalidateQueries({ queryKey: ["filament", variables.id] });
    },
  });
}

export function useDeleteFilament() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/filaments/${id}`, { method: "DELETE" }).then((res) => {
        if (!res.ok) throw new Error("Delete failed");
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["filaments"] });
    },
  });
}

// ─── Usage Logs ───────────────────────────────────────────────────────────────

export function useFilamentUsageLogs(filamentId: string, page = 1) {
  return useQuery({
    queryKey: ["filament-usage", filamentId, page],
    queryFn: () =>
      fetchJson(`/api/filaments/${filamentId}/usage?page=${page}&limit=20`),
    enabled: !!filamentId,
  });
}

export function useAddUsageLog(filamentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UsageLogInput) =>
      fetchJson(`/api/filaments/${filamentId}/usage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["filament-usage", filamentId] });
      queryClient.invalidateQueries({ queryKey: ["filament", filamentId] });
      queryClient.invalidateQueries({ queryKey: ["filaments"] });
    },
  });
}
