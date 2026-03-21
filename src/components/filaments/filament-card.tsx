"use client";

import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ColorSwatch } from "@/components/filaments/color-swatch";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useDeleteFilament } from "@/lib/hooks/use-filaments";
import { useSettings } from "@/lib/hooks/use-settings";
import { toast } from "sonner";

export interface Filament {
  id: string;
  brand: string;
  type: string;
  colorName: string;
  colorHex: string;
  totalWeightG: number;
  remainingWeightG: number;
  spoolCount: number;
  purchasePriceTotal: number;
  lowStockThresholdG: number | null;
}

interface FilamentCardProps {
  filament: Filament;
}

export function FilamentCard({ filament }: FilamentCardProps) {
  const router = useRouter();
  const { mutate: deleteFilament, isPending: isDeleting } = useDeleteFilament();
  const { data: appSettings } = useSettings();

  const threshold = filament.lowStockThresholdG ?? appSettings?.lowStockThresholdG ?? 100;
  const isLowStock = filament.remainingWeightG < threshold;
  const progressValue = filament.totalWeightG > 0
    ? Math.round((filament.remainingWeightG / filament.totalWeightG) * 100)
    : 0;

  function handleDelete() {
    deleteFilament(filament.id, {
      onSuccess: () => toast.success("Filament deleted"),
      onError: () => toast.error("Failed to delete filament"),
    });
  }

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <ColorSwatch hex={filament.colorHex} name={filament.colorName} />
            <div className="min-w-0">
              <p className="font-semibold truncate">{filament.brand}</p>
              <p className="text-sm text-muted-foreground truncate">{filament.colorName}</p>
            </div>
          </div>
          <Badge variant="secondary" className="shrink-0">{filament.type}</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 flex-1">
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Remaining</span>
            <span className={isLowStock ? "text-destructive font-medium" : ""}>
              {filament.remainingWeightG}g / {filament.totalWeightG}g
            </span>
          </div>
          <Progress
            value={progressValue}
            className={isLowStock ? "[&>div]:bg-destructive" : ""}
          />
          {isLowStock && (
            <p className="text-xs text-destructive">Low stock</p>
          )}
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{filament.spoolCount} spool{filament.spoolCount !== 1 ? "s" : ""}</span>
          <span>${filament.purchasePriceTotal.toFixed(2)}</span>
        </div>

        <div className="flex gap-2 mt-auto pt-1">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => router.push(`/filaments/${filament.id}`)}
          >
            <Pencil className="h-3.5 w-3.5 mr-1" />
            Edit
          </Button>
          <ConfirmDialog
            trigger={
              <Button variant="outline" size="sm" disabled={isDeleting}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            }
            title="Delete filament?"
            description={`This will permanently delete "${filament.brand} ${filament.colorName}" and all associated usage logs.`}
            onConfirm={handleDelete}
            isPending={isDeleting}
          />
        </div>
      </CardContent>
    </Card>
  );
}
