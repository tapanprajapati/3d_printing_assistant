export interface CalculatorInputs {
  filamentCostPerGram: number;
  gramsUsed: number;
  printTimeHours: number;
  electricityRateKwh: number;
  printerWattageW: number;
  laborRatePerHour: number;
  platformFeePercent: number;
  sellingPrice: number;
}

export interface CalculatorResult {
  filamentCost: number;
  electricityCost: number;
  laborCost: number;
  platformFee: number;
  totalCost: number;
  netProfit: number;
  marginPercent: number;
}

export function calculate(inputs: CalculatorInputs): CalculatorResult {
  const filamentCost = inputs.gramsUsed * inputs.filamentCostPerGram;
  const electricityCost =
    inputs.printTimeHours * (inputs.printerWattageW / 1000) * inputs.electricityRateKwh;
  const laborCost = inputs.printTimeHours * inputs.laborRatePerHour;
  const platformFee = inputs.sellingPrice * (inputs.platformFeePercent / 100);
  const totalCost = filamentCost + electricityCost + laborCost + platformFee;
  const netProfit = inputs.sellingPrice - totalCost;
  const marginPercent =
    inputs.sellingPrice === 0 ? 0 : (netProfit / inputs.sellingPrice) * 100;

  return {
    filamentCost,
    electricityCost,
    laborCost,
    platformFee,
    totalCost,
    netProfit,
    marginPercent,
  };
}
