import { z } from "zod";

export const ProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]),
});

export const ProductUpdateSchema = ProductSchema.partial();

export const ProductVariantSchema = z.object({
  name: z.string().min(1, "Name is required"),
  sku: z.string().min(1, "SKU is required"),
  sellingPrice: z.number().min(0, "Selling price cannot be negative"),
  materialCostG: z.number().min(0, "Material cost cannot be negative"),
  printTimeHours: z.number().min(0, "Print time cannot be negative"),
  notes: z.string().optional(),
});

export const ProductVariantUpdateSchema = ProductVariantSchema.partial();

export const ProductAssetUpdateSchema = z.object({
  isPrimary: z.boolean().optional(),
  displayOrder: z.number().int().optional(),
  version: z.string().optional().nullable(),
  versionNote: z.string().optional().nullable(),
});

export type ProductInput = z.infer<typeof ProductSchema>;
export type ProductUpdateInput = z.infer<typeof ProductUpdateSchema>;
export type ProductVariantInput = z.infer<typeof ProductVariantSchema>;
export type ProductVariantUpdateInput = z.infer<typeof ProductVariantUpdateSchema>;
export type ProductAssetUpdateInput = z.infer<typeof ProductAssetUpdateSchema>;
