"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Package } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ProductTable } from "@/components/products/product-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProducts } from "@/lib/hooks/use-products";
import type { Product } from "@/components/products/product-card";

export default function ProductsPage() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");

  const { data, isLoading } = useProducts({
    status: statusFilter !== "All" ? statusFilter : undefined,
    search: search || undefined,
  });

  const products = (data?.data ?? []) as Product[];

  return (
    <div>
      <PageHeader title="Products" description="Manage your product catalog">
        <Button onClick={() => router.push("/products/new")}>+ New Product</Button>
      </PageHeader>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All</SelectItem>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="ARCHIVED">Archived</SelectItem>
          </SelectContent>
        </Select>

        <Input
          placeholder="Search by name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-56"
        />
      </div>

      {/* Content */}
      {!isLoading && products.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No products yet"
          description="Add your first product to start building your catalog."
          action={<Button onClick={() => router.push("/products/new")}>Add Product</Button>}
        />
      ) : (
        <ProductTable products={products} isLoading={isLoading} />
      )}
    </div>
  );
}
