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
import { PrintJobSchema, type PrintJobInput } from "@/lib/validations/print-job";
import { useProducts, useProductVariants } from "@/lib/hooks/use-products";
import { useFilaments } from "@/lib/hooks/use-filaments";

interface PrintJobFormProps {
  defaultValues?: Partial<PrintJobInput>;
  onSubmit: (data: PrintJobInput) => void;
  isPending?: boolean;
  submitLabel?: string;
}

export function PrintJobForm({
  defaultValues,
  onSubmit,
  isPending,
  submitLabel = "Save",
}: PrintJobFormProps) {
  const form = useForm<PrintJobInput>({
    resolver: zodResolver(PrintJobSchema),
    defaultValues: {
      title: "",
      productId: undefined,
      variantId: undefined,
      filamentId: undefined,
      estimatedHours: undefined,
      scheduledAt: undefined,
      notes: "",
      ...defaultValues,
    },
  });

  const productId = form.watch("productId");

  const { data: productsData } = useProducts();
  const { data: variantsData } = useProductVariants(productId ?? "");
  const { data: filamentsData } = useFilaments();

  const products = productsData?.data ?? [];
  const variants = variantsData?.data ?? [];
  const filaments = filamentsData?.data ?? [];

  function handleProductChange(value: string) {
    form.setValue("productId", value === "__none__" ? undefined : value);
    form.setValue("variantId", undefined);
  }

  function handleVariantChange(value: string) {
    form.setValue("variantId", value === "__none__" ? undefined : value);
    const variant = variants.find((v: { id: string; printTimeHours: number }) => v.id === value);
    if (variant?.printTimeHours != null) {
      form.setValue("estimatedHours", variant.printTimeHours);
    }
  }

  // Convert datetime-local value to ISO string for the form
  function handleScheduledAtChange(value: string) {
    if (!value) {
      form.setValue("scheduledAt", undefined);
    } else {
      form.setValue("scheduledAt", new Date(value).toISOString());
    }
  }

  // Convert ISO string back to datetime-local format
  function toDatetimeLocal(isoString?: string) {
    if (!isoString) return "";
    const d = new Date(isoString);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Title — full width */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Coaster Set — Blue" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Product */}
          <FormField
            control={form.control}
            name="productId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Product <span className="text-muted-foreground font-normal">optional</span>
                </FormLabel>
                <Select
                  onValueChange={handleProductChange}
                  value={field.value ?? "__none__"}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="__none__">None</SelectItem>
                    {products.map((p: { id: string; name: string }) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Variant */}
          <FormField
            control={form.control}
            name="variantId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Variant <span className="text-muted-foreground font-normal">optional</span>
                </FormLabel>
                <Select
                  onValueChange={handleVariantChange}
                  value={field.value ?? "__none__"}
                  disabled={!productId}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={productId ? "Select variant" : "Select a product first"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="__none__">None</SelectItem>
                    {variants.map((v: { id: string; name: string }) => (
                      <SelectItem key={v.id} value={v.id}>
                        {v.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Filament */}
          <FormField
            control={form.control}
            name="filamentId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Filament <span className="text-muted-foreground font-normal">optional</span>
                </FormLabel>
                <Select
                  onValueChange={(v) => form.setValue("filamentId", v === "__none__" ? undefined : v)}
                  value={field.value ?? "__none__"}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select filament" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="__none__">None</SelectItem>
                    {filaments.map((f: { id: string; brand: string; colorName: string; type: string }) => (
                      <SelectItem key={f.id} value={f.id}>
                        {f.brand} {f.colorName} ({f.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Estimated Hours */}
          <FormField
            control={form.control}
            name="estimatedHours"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Estimated Hours <span className="text-muted-foreground font-normal">optional</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.25"
                    min="0"
                    placeholder="e.g. 2.5"
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(e.target.value === "" ? undefined : parseFloat(e.target.value))
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Scheduled At */}
          <FormField
            control={form.control}
            name="scheduledAt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Scheduled At <span className="text-muted-foreground font-normal">optional</span>
                </FormLabel>
                <FormControl>
                  <input
                    type="datetime-local"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={toDatetimeLocal(field.value)}
                    onChange={(e) => handleScheduledAtChange(e.target.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Notes — full width */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Notes <span className="text-muted-foreground font-normal">optional</span>
              </FormLabel>
              <FormControl>
                <textarea
                  rows={3}
                  placeholder="Any notes about this print job..."
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
