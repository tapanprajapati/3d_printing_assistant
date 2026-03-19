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
import { ProductVariantSchema, type ProductVariantInput } from "@/lib/validations/product";

interface VariantFormProps {
  defaultValues?: Partial<ProductVariantInput>;
  onSubmit: (data: ProductVariantInput) => void;
  isPending?: boolean;
  submitLabel?: string;
}

export function VariantForm({
  defaultValues,
  onSubmit,
  isPending,
  submitLabel = "Save",
}: VariantFormProps) {
  const form = useForm<ProductVariantInput>({
    resolver: zodResolver(ProductVariantSchema),
    defaultValues: {
      name: "",
      sku: "",
      sellingPrice: 0,
      materialCostG: 0,
      printTimeHours: 0,
      notes: "",
      ...defaultValues,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Standard 4-pack" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* SKU */}
          <FormField
            control={form.control}
            name="sku"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SKU</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. CST-001" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Selling Price */}
          <FormField
            control={form.control}
            name="sellingPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Selling Price ($)</FormLabel>
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

          {/* Material Cost */}
          <FormField
            control={form.control}
            name="materialCostG"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Material Cost (g)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    step="0.1"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Print Time */}
          <FormField
            control={form.control}
            name="printTimeHours"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Print Time (h)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    step="0.25"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
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
                <Input placeholder="Any additional notes..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving…" : submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}
