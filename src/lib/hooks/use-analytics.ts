"use client";

import { useQuery } from "@tanstack/react-query";

export function useAnalytics(from: string, to: string) {
  return useQuery({
    queryKey: ["analytics", from, to],
    queryFn: () =>
      fetch(`/api/analytics?from=${from}&to=${to}`).then((r) => r.json()),
    staleTime: 60_000,
  });
}
