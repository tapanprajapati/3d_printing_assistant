import { z } from "zod";

export const FilamentSchema = z.object({
  brand: z.string().min(1, "Brand is required"),
  type: z.string().min(1, "Type is required"),
  colorName: z.string().min(1, "Color name is required"),
  colorHex: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color (e.g. #FF5733)"),
  totalWeightG: z.number().int().positive("Total weight must be positive"),
  remainingWeightG: z.number().int().min(0, "Remaining weight cannot be negative"),
  spoolCount: z.number().int().positive("Spool count must be at least 1"),
  purchasePriceTotal: z.number().min(0, "Purchase price cannot be negative"),
  lowStockThresholdG: z.number().int().positive().optional(),
  notes: z.string().optional(),
});

export const FilamentUpdateSchema = FilamentSchema.partial();

export const UsageLogSchema = z.object({
  gramsUsed: z.number().positive("Grams used must be positive"),
  note: z.string().optional(),
});

export type FilamentInput = z.infer<typeof FilamentSchema>;
export type FilamentUpdateInput = z.infer<typeof FilamentUpdateSchema>;
export type UsageLogInput = z.infer<typeof UsageLogSchema>;
