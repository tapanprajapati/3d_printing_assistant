"use client";

import { Suspense, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSearchParams } from "next/navigation";
import { Calculator } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFilaments } from "@/lib/hooks/use-filaments";
import { useSettings } from "@/lib/hooks/use-settings";
import { useVariantById } from "@/lib/hooks/use-products";
import { calculate } from "@/lib/utils/cost-calculator";
import { type CalculatorInput } from "@/lib/validations/calculator";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Filament {
  id: string;
  brand: string;
  type: string;
  colorName: string;
  colorHex: string;
  totalWeightG: number;
  purchasePriceTotal: number;
}

// ─── Number input helper ──────────────────────────────────────────────────────

function NumInput({
  id,
  label,
  step = "0.01",
  min = "0",
  value,
  onChange,
  suffix,
}: {
  id: string;
  label: string;
  step?: string;
  min?: string;
  value: number;
  onChange: (v: number) => void;
  suffix?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type="number"
          step={step}
          min={min}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className={suffix ? "pr-10" : undefined}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Result row ───────────────────────────────────────────────────────────────

function ResultRow({
  label,
  value,
  bold,
  color,
}: {
  label: string;
  value: string;
  bold?: boolean;
  color?: "green" | "red";
}) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className={cn("text-sm", bold && "font-semibold")}>{label}</span>
      <span
        className={cn(
          "text-sm tabular-nums",
          bold && "font-semibold",
          color === "green" && "text-green-600 dark:text-green-400",
          color === "red" && "text-red-600 dark:text-red-400"
        )}
      >
        {value}
      </span>
    </div>
  );
}

// ─── Main content (uses useSearchParams) ──────────────────────────────────────

function CalculatorContent() {
  const searchParams = useSearchParams();
  const variantId = searchParams.get("variantId") ?? undefined;

  const { data: filamentsData } = useFilaments();
  const filaments = (filamentsData?.data ?? []) as Filament[];

  const { data: settings, isLoading: settingsLoading } = useSettings();
  const { data: variantData } = useVariantById(variantId);

  const [selectedFilamentId, setSelectedFilamentId] = useState<string>("");

  const { setValue, watch } = useForm<CalculatorInput>({
    defaultValues: {
      filamentCostPerGram: 0,
      gramsUsed: 0,
      printTimeHours: 1,
      electricityRateKwh: 0.12,
      printerWattageW: 200,
      laborRatePerHour: 15,
      platformFeePercent: 6.5,
      sellingPrice: 0,
    },
  });

  const values = watch();
  const result = calculate(values);

  // Apply settings defaults when loaded
  useEffect(() => {
    if (!settings) return;
    setValue("electricityRateKwh", settings.electricityRateKwh ?? 0.12);
    setValue("printerWattageW", settings.printerWattage ?? 200);
    setValue("laborRatePerHour", settings.laborRatePerHour ?? 15);
    setValue("platformFeePercent", settings.defaultPlatformFee ?? 6.5);
  }, [settings, setValue]);

  // Pre-fill from variantId query param
  useEffect(() => {
    if (!variantData) return;
    if (variantData.materialCostG != null) setValue("gramsUsed", variantData.materialCostG);
    if (variantData.printTimeHours != null) setValue("printTimeHours", variantData.printTimeHours);
    if (variantData.sellingPrice != null) setValue("sellingPrice", variantData.sellingPrice);
  }, [variantData, setValue]);

  if (settingsLoading) {
    return <Skeleton className="h-96 rounded-lg" />;
  }

  // Update filamentCostPerGram when filament selection changes
  function handleFilamentChange(filamentId: string) {
    setSelectedFilamentId(filamentId);
    const f = filaments.find((f) => f.id === filamentId);
    if (f && f.totalWeightG > 0) {
      setValue("filamentCostPerGram", f.purchasePriceTotal / f.totalWeightG);
    } else {
      setValue("filamentCostPerGram", 0);
    }
  }

  const selectedFilament = filaments.find((f) => f.id === selectedFilamentId);
  const profitColor = result.netProfit >= 0 ? "green" : "red";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* ── Left: Inputs ── */}
      <div className="space-y-5">
        {/* Filament */}
        <div className="space-y-1.5">
          <Label>Filament</Label>
          <div className="flex items-center gap-2">
            {selectedFilament && (
              <span
                className="inline-block h-6 w-6 rounded-full border flex-shrink-0"
                style={{ backgroundColor: selectedFilament.colorHex }}
                title={selectedFilament.colorName}
              />
            )}
            <Select value={selectedFilamentId} onValueChange={handleFilamentChange}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select filament…" />
              </SelectTrigger>
              <SelectContent>
                {filaments.map((f) => (
                  <SelectItem key={f.id} value={f.id}>
                    <span className="flex items-center gap-2">
                      <span
                        className="inline-block h-3 w-3 rounded-full border"
                        style={{ backgroundColor: f.colorHex }}
                      />
                      {f.brand} {f.type} — {f.colorName}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <p className="text-xs text-muted-foreground">
            Cost/g:{" "}
            {selectedFilament && selectedFilament.totalWeightG > 0
              ? `$${(selectedFilament.purchasePriceTotal / selectedFilament.totalWeightG).toFixed(4)}`
              : "—"}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <NumInput
            id="gramsUsed"
            label="Filament used (g)"
            step="0.1"
            value={values.gramsUsed}
            onChange={(v) => setValue("gramsUsed", v)}
          />
          <NumInput
            id="printTimeHours"
            label="Print time (h)"
            step="0.1"
            value={values.printTimeHours}
            onChange={(v) => setValue("printTimeHours", v)}
          />
        </div>

        <Separator />

        <div className="grid grid-cols-2 gap-4">
          <NumInput
            id="electricityRateKwh"
            label="Electricity rate"
            step="0.001"
            value={values.electricityRateKwh}
            onChange={(v) => setValue("electricityRateKwh", v)}
            suffix="$/kWh"
          />
          <NumInput
            id="printerWattageW"
            label="Printer wattage"
            step="1"
            value={values.printerWattageW}
            onChange={(v) => setValue("printerWattageW", v)}
            suffix="W"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <NumInput
            id="laborRatePerHour"
            label="Labor rate"
            step="0.5"
            value={values.laborRatePerHour}
            onChange={(v) => setValue("laborRatePerHour", v)}
            suffix="$/h"
          />
          <NumInput
            id="platformFeePercent"
            label="Platform fee"
            step="0.1"
            value={values.platformFeePercent}
            onChange={(v) => setValue("platformFeePercent", v)}
            suffix="%"
          />
        </div>

        <Separator />

        <NumInput
          id="sellingPrice"
          label="Selling price ($)"
          step="0.01"
          value={values.sellingPrice}
          onChange={(v) => setValue("sellingPrice", v)}
        />
      </div>

      {/* ── Right: Results ── */}
      <div>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Calculator className="h-4 w-4" />
              Cost Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-0.5">
            <ResultRow label="Filament cost" value={`$${result.filamentCost.toFixed(2)}`} />
            <ResultRow label="Electricity cost" value={`$${result.electricityCost.toFixed(2)}`} />
            <ResultRow label="Labor cost" value={`$${result.laborCost.toFixed(2)}`} />
            <ResultRow label="Platform fee" value={`$${result.platformFee.toFixed(2)}`} />

            <Separator className="my-2" />

            <ResultRow
              label="Total cost"
              value={`$${result.totalCost.toFixed(2)}`}
              bold
            />
            <ResultRow
              label="Net profit"
              value={`$${result.netProfit.toFixed(2)}`}
              bold
              color={profitColor}
            />

            <Separator className="my-2" />

            <ResultRow
              label="Margin"
              value={`${result.marginPercent.toFixed(1)}%`}
              bold
              color={profitColor}
            />
          </CardContent>
        </Card>

        {values.sellingPrice > 0 && result.netProfit < 0 && (
          <p className="mt-3 text-sm text-red-600 dark:text-red-400">
            Selling price is below total cost — this listing loses money.
          </p>
        )}

        {values.sellingPrice > 0 && result.marginPercent > 0 && result.marginPercent < 20 && (
          <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">
            Margin below 20% — consider increasing your price.
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CalculatorPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Cost Calculator"
        description="Calculate profit margin from filament, electricity, labor, and platform fees."
      />
      <Suspense fallback={<Skeleton className="h-96 rounded-lg" />}>
        <CalculatorContent />
      </Suspense>
    </div>
  );
}
