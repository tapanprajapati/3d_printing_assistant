"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Package } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { FilamentCard } from "@/components/filaments/filament-card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useFilaments } from "@/lib/hooks/use-filaments";
import type { Filament } from "@/components/filaments/filament-card";

const FILAMENT_TYPES = ["All", "PLA", "PETG", "ABS", "ASA", "TPU", "Nylon", "Resin", "Other"];

export default function FilamentsPage() {
  const router = useRouter();
  const [typeFilter, setTypeFilter] = useState("All");
  const [lowStockOnly, setLowStockOnly] = useState(false);

  const { data, isLoading } = useFilaments({
    type: typeFilter !== "All" ? typeFilter : undefined,
    lowStock: lowStockOnly || undefined,
  });

  const filaments = (data?.data ?? []) as Filament[];

  return (
    <div>
      <PageHeader title="Filaments" description="Manage your filament inventory">
        <Button onClick={() => router.push("/filaments/new")}>
          + New Filament
        </Button>
      </PageHeader>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            {FILAMENT_TYPES.map((t) => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant={lowStockOnly ? "destructive" : "outline"}
          size="sm"
          onClick={() => setLowStockOnly((v) => !v)}
        >
          Low Stock Only {lowStockOnly && "✓"}
        </Button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-52 rounded-lg" />
          ))}
        </div>
      ) : filaments.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No filaments yet"
          description="Add your first filament spool to start tracking your inventory."
          action={
            <Button onClick={() => router.push("/filaments/new")}>
              Add Filament
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filaments.map((f) => (
            <FilamentCard key={f.id} filament={f} />
          ))}
        </div>
      )}
    </div>
  );
}
