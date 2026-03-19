"use client";

import { ListingsTable } from "@/components/shared/listings-table";

export function ListingsTab({ productId }: { productId: string }) {
  return (
    <div className="max-w-5xl">
      <ListingsTable productId={productId} />
    </div>
  );
}
