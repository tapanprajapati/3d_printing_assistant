"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { ListingCreateInput, ListingUpdateInput } from "@/lib/validations/listing";

async function fetchJson(url: string, options?: RequestInit) {
  const res = await fetch(url, options);
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(error.error ?? "Request failed");
  }
  return res.json();
}

export function useListings(productId: string) {
  return useQuery({
    queryKey: ["listings", productId],
    queryFn: () => fetchJson(`/api/products/${productId}/listings`),
    enabled: !!productId,
  });
}

export function useCreateListing(productId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ListingCreateInput) =>
      fetchJson(`/api/products/${productId}/listings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listings", productId] });
    },
  });
}

export function useUpdateListing(productId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ listingId, data }: { listingId: string; data: ListingUpdateInput }) =>
      fetchJson(`/api/products/${productId}/listings/${listingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listings", productId] });
    },
  });
}

export function useDeleteListing(productId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (listingId: string) =>
      fetch(`/api/products/${productId}/listings/${listingId}`, {
        method: "DELETE",
      }).then((res) => {
        if (!res.ok) throw new Error("Delete failed");
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listings", productId] });
    },
  });
}
