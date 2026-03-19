"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { PrintJobInput, PrintJobUpdateInput } from "@/lib/validations/print-job";

async function fetchJson(url: string, options?: RequestInit) {
  const res = await fetch(url, options);
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(error.error ?? "Request failed");
  }
  return res.json();
}

export function usePrintJobs(filters?: { status?: string; showArchived?: boolean }) {
  const params = new URLSearchParams();
  if (filters?.status) params.set("status", filters.status);
  if (filters?.showArchived) params.set("showArchived", "true");
  const query = params.toString() ? `?${params.toString()}` : "";

  return useQuery({
    queryKey: ["print-jobs", filters],
    queryFn: () => fetchJson(`/api/print-jobs${query}`),
  });
}

export function usePrintJob(id: string) {
  return useQuery({
    queryKey: ["print-job", id],
    queryFn: () => fetchJson(`/api/print-jobs/${id}`),
    enabled: !!id,
  });
}

export function useCreatePrintJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: PrintJobInput) =>
      fetchJson("/api/print-jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["print-jobs"] });
    },
  });
}

export function useUpdatePrintJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PrintJobUpdateInput }) =>
      fetchJson(`/api/print-jobs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["print-jobs"] });
      queryClient.invalidateQueries({ queryKey: ["print-job", variables.id] });
    },
  });
}

export function useDeletePrintJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/print-jobs/${id}`, { method: "DELETE" }).then((res) => {
        if (!res.ok) throw new Error("Delete failed");
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["print-jobs"] });
    },
  });
}
