"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ColorSwatch } from "@/components/filaments/color-swatch";
import { FilamentSchema, type FilamentInput } from "@/lib/validations/filament";

const FILAMENT_TYPES = ["PLA", "PETG", "ABS", "ASA", "TPU", "Nylon", "Resin", "Other"];

interface FilamentFormProps {
  defaultValues?: Partial<FilamentInput>;
  onSubmit: (data: FilamentInput) => void;
  isPending?: boolean;
  submitLabel?: string;
}

export function FilamentForm({
  defaultValues,
  onSubmit,
  isPending,
  submitLabel = "Save",
}: FilamentFormProps) {
  const form = useForm<FilamentInput>({
    resolver: zodResolver(FilamentSchema),
    defaultValues: {
      brand: "",
      type: "PLA",
      colorName: "",
      colorHex: "#ffffff",
      totalWeightG: 1000,
      remainingWeightG: 1000,
      spoolCount: 1,
      purchasePriceTotal: 0,
      lowStockThresholdG: undefined,
      notes: "",
      ...defaultValues,
    },
  });

  const watchedHex = form.watch("colorHex");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Brand */}
          <FormField
            control={form.control}
            name="brand"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Brand</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Hatchbox" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Type */}
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {FILAMENT_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Color Name */}
          <FormField
            control={form.control}
            name="colorName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Color Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Galaxy Black" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Color Hex */}
          <FormField
            control={form.control}
            name="colorHex"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Color</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      className="h-9 w-12 cursor-pointer rounded border border-input bg-background p-0.5"
                    />
                    <Input
                      {...field}
                      placeholder="#000000"
                      className="font-mono"
                    />
                    <ColorSwatch hex={watchedHex ?? "#ffffff"} size="md" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Total Weight */}
          <FormField
            control={form.control}
            name="totalWeightG"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total Weight (g)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Remaining Weight */}
          <FormField
            control={form.control}
            name="remainingWeightG"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Remaining Weight (g)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Spool Count */}
          <FormField
            control={form.control}
            name="spoolCount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Spool Count</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 1)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Purchase Price */}
          <FormField
            control={form.control}
            name="purchasePriceTotal"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Purchase Price Total ($)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Low Stock Threshold */}
          <FormField
            control={form.control}
            name="lowStockThresholdG"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Low Stock Threshold (g){" "}
                  <span className="text-muted-foreground font-normal">optional</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    placeholder="Default: 100"
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(e.target.value ? parseInt(e.target.value, 10) : undefined)
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Notes */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Notes{" "}
                <span className="text-muted-foreground font-normal">optional</span>
              </FormLabel>
              <FormControl>
                <textarea
                  rows={3}
                  placeholder="Any additional notes..."
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
          {isPending ? "Saving…" : submitLabel}
        </Button>
      </form>
    </Form>
  );
}
