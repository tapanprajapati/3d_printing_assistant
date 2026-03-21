import { z } from "zod";

export const settingsSchema = z.object({
  electricityRateKwh: z.number().min(0),
  printerWattage: z.number().min(0),
  laborRatePerHour: z.number().min(0),
  defaultPlatformFee: z.number().min(0).max(100),
  currencySymbol: z.string().min(1).max(5),
  lowStockThresholdG: z.number().int().min(0),
});

export type SettingsInput = z.infer<typeof settingsSchema>;
