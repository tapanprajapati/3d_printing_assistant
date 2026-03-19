"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Package } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { FilamentTable } from "@/components/filaments/filament-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFilaments } from "@/lib/hooks/use-filaments";
import type { Filament } from "@/components/filaments/filament-card";

const FILAMENT_TYPES = ["All", "PLA", "PETG", "ABS", "ASA", "TPU", "Nylon", "Resin", "Other"];

export default function FilamentsPage() {
  const router = useRouter();
  const [typeFilter, setTypeFilter] = useState("All");
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [search, setSearch] = useState("");

  const { data, isLoading } = useFilaments({
    type: typeFilter !== "All" ? typeFilter : undefined,
    lowStock: lowStockOnly || undefined,
  });

  const allFilaments = (data?.data ?? []) as Filament[];
  const filaments = allFilaments.filter((f) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return f.brand.toLowerCase().includes(q) || f.colorName.toLowerCase().includes(q);
  });

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

        <Input
          placeholder="Search by brand or color…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-56"
        />
      </div>

      {/* Content */}
      {!isLoading && filaments.length === 0 ? (
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
        <FilamentTable filaments={filaments} isLoading={isLoading} />
      )}
    </div>
  );
}
