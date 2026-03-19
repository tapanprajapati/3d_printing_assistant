import { z } from "zod";

export const ListingCreateSchema = z.object({
  marketplace: z.string().min(1, "Marketplace is required"),
  listingId: z.string().optional(),
  listingUrl: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
  listedPrice: z.number().positive("Price must be positive"),
  platformFee: z.number().min(0).max(100).optional(),
  status: z
    .enum(["DRAFT", "ACTIVE", "INACTIVE", "SOLD_OUT"])
    .default("DRAFT"),
  dateListed: z.string().datetime().optional().or(z.literal("")),
  notes: z.string().optional(),
});

export const ListingUpdateSchema = ListingCreateSchema.partial();

export type ListingCreateInput = z.infer<typeof ListingCreateSchema>;
export type ListingUpdateInput = z.infer<typeof ListingUpdateSchema>;
