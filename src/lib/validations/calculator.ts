import { z } from "zod";

export const CalculatorSchema = z.object({
  filamentCostPerGram: z.number().nonnegative(),
  gramsUsed: z.number().nonnegative(),
  printTimeHours: z.number().nonnegative(),
  electricityRateKwh: z.number().nonnegative(),
  printerWattageW: z.number().nonnegative(),
  laborRatePerHour: z.number().nonnegative(),
  platformFeePercent: z.number().nonnegative(),
  sellingPrice: z.number().nonnegative(),
});

export type CalculatorInput = z.infer<typeof CalculatorSchema>;
