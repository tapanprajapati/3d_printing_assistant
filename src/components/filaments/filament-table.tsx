"use client";

import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ColorSwatch } from "@/components/filaments/color-swatch";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useDeleteFilament } from "@/lib/hooks/use-filaments";
import { useSettings } from "@/lib/hooks/use-settings";
import { toast } from "sonner";
import type { Filament } from "@/components/filaments/filament-card";

interface FilamentTableProps {
  filaments: Filament[];
  isLoading?: boolean;
}

function FilamentRow({ filament }: { filament: Filament }) {
  const router = useRouter();
  const { mutate: deleteFilament, isPending: isDeleting } = useDeleteFilament();
  const { data: appSettings } = useSettings();

  const threshold = filament.lowStockThresholdG ?? appSettings?.lowStockThresholdG ?? 100;
  const isLowStock = filament.remainingWeightG < threshold;

  function handleDelete() {
    deleteFilament(filament.id, {
      onSuccess: () => toast.success("Filament deleted"),
      onError: () => toast.error("Failed to delete filament"),
    });
  }

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-2">
          <ColorSwatch hex={filament.colorHex} name={filament.colorName} size="sm" />
          <span>{filament.colorName}</span>
        </div>
      </TableCell>
      <TableCell>{filament.brand}</TableCell>
      <TableCell>
        <Badge variant="secondary">{filament.type}</Badge>
      </TableCell>
      <TableCell>
        <span className={isLowStock ? "text-destructive font-medium" : ""}>
          {filament.remainingWeightG}g / {filament.totalWeightG}g
        </span>
        {isLowStock && (
          <span className="ml-2 text-xs text-destructive">Low stock</span>
        )}
      </TableCell>
      <TableCell>{filament.spoolCount}</TableCell>
      <TableCell>${filament.purchasePriceTotal.toFixed(2)}</TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(`/filaments/${filament.id}`)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <ConfirmDialog
            trigger={
              <Button variant="ghost" size="icon" disabled={isDeleting}>
                <Trash2 className="h-4 w-4" />
              </Button>
            }
            title="Delete filament?"
            description={`This will permanently delete "${filament.brand} ${filament.colorName}" and all associated usage logs.`}
            onConfirm={handleDelete}
            isPending={isDeleting}
          />
        </div>
      </TableCell>
    </TableRow>
  );
}

export function FilamentTable({ filaments, isLoading }: FilamentTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Color</TableHead>
            <TableHead>Brand</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Remaining</TableHead>
            <TableHead>Spools</TableHead>
            <TableHead>Price</TableHead>
            <TableHead className="w-20">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: 7 }).map((_, j) => (
                  <TableCell key={j}>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            filaments.map((f) => <FilamentRow key={f.id} filament={f} />)
          )}
        </TableBody>
      </Table>
    </div>
  );
}
