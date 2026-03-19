import { z } from "zod";

export const PrintJobSchema = z.object({
  title: z.string().min(1, "Title is required"),
  productId: z.string().cuid().optional(),
  variantId: z.string().cuid().optional(),
  filamentId: z.string().cuid().optional(),
  estimatedHours: z.number().min(0).optional(),
  scheduledAt: z.string().datetime().optional(),
  notes: z.string().optional(),
});

export const PrintJobUpdateSchema = PrintJobSchema.partial().extend({
  status: z.enum(["QUEUED", "IN_PROGRESS", "COMPLETED", "FAILED", "CANCELLED"]).optional(),
  actualHours: z.number().min(0).optional(),
  gramsUsed: z.number().min(0).optional(),
});

export type PrintJobInput = z.infer<typeof PrintJobSchema>;
export type PrintJobUpdateInput = z.infer<typeof PrintJobUpdateSchema>;
