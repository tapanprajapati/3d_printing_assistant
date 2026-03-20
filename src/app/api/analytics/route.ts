import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const year = new Date().getFullYear();
  const fromStr = searchParams.get("from") ?? `${year}-01-01`;
  const toStr = searchParams.get("to") ?? `${year}-12-31`;

  const from = new Date(`${fromStr}T00:00:00.000Z`);
  const to = new Date(`${toStr}T23:59:59.999Z`);

  const [jobs, settings] = await Promise.all([
    prisma.printJob.findMany({
      where: {
        status: "COMPLETED",
        completedAt: { gte: from, lte: to },
      },
      include: {
        variant: { include: { product: true } },
        filament: true,
      },
    }),
    prisma.appSettings.findFirst(),
  ]);

  const electricityRateKwh = settings?.electricityRateKwh ?? 0.12;
  const printerWattage = settings?.printerWattage ?? 200;
  const laborRatePerHour = settings?.laborRatePerHour ?? 15;
  const defaultPlatformFee = settings?.defaultPlatformFee ?? 6.5;

  // Per-job cost calculation
  interface JobCalc {
    month: string; // e.g. "Jan 2025"
    revenue: number;
    filamentCost: number;
    electricityCost: number;
    laborCost: number;
    platformFee: number;
    profit: number;
    hasRevenue: boolean;
    productName: string;
    filamentKey: string;
    filamentBrand: string;
    filamentColorName: string;
    filamentColor: string;
    gramsUsed: number;
  }

  const jobCalcs: JobCalc[] = jobs.map((job) => {
    const gramsUsed = job.gramsUsed ?? 0;
    const actualHours = job.actualHours ?? 0;

    const filamentCostPerG =
      job.filament && job.filament.totalWeightG > 0
        ? job.filament.purchasePriceTotal / job.filament.totalWeightG
        : 0;

    const filamentCost = gramsUsed * filamentCostPerG;
    const electricityCost = actualHours * (printerWattage / 1000) * electricityRateKwh;
    const laborCost = actualHours * laborRatePerHour;

    const hasRevenue = !!job.variant;
    const sellingPrice = job.variant?.sellingPrice ?? 0;
    const platformFee = hasRevenue ? sellingPrice * (defaultPlatformFee / 100) : 0;
    const totalCost = filamentCost + electricityCost + laborCost + platformFee;
    const revenue = hasRevenue ? sellingPrice : 0;
    const profit = hasRevenue ? revenue - totalCost : 0;

    const completedAt = job.completedAt ?? new Date();
    const month = completedAt.toLocaleString("en-US", {
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    });

    const filamentKey = job.filament
      ? `${job.filament.brand} ${job.filament.colorName}`
      : "Unknown";
    const filamentBrand = job.filament?.brand ?? "Unknown";
    const filamentColorName = job.filament?.colorName ?? "Unknown";
    const filamentColor = job.filament?.colorHex ?? "#888888";

    const productName =
      job.variant?.product?.name ?? job.variant?.name ?? "Unnamed";

    return {
      month,
      revenue,
      filamentCost,
      electricityCost,
      laborCost,
      platformFee,
      profit,
      hasRevenue,
      productName,
      filamentKey,
      filamentBrand,
      filamentColorName,
      filamentColor,
      gramsUsed,
    };
  });

  // Monthly aggregation
  const monthMap = new Map<
    string,
    { revenue: number; profit: number; jobs: number; date: Date }
  >();
  jobs.forEach((job, i) => {
    const calc = jobCalcs[i];
    const completedAt = job.completedAt ?? new Date();
    const key = calc.month;
    const existing = monthMap.get(key);
    if (existing) {
      existing.revenue += calc.revenue;
      existing.profit += calc.profit;
      existing.jobs += 1;
    } else {
      monthMap.set(key, {
        revenue: calc.revenue,
        profit: calc.profit,
        jobs: 1,
        date: completedAt,
      });
    }
  });

  const monthlyData = Array.from(monthMap.entries())
    .sort((a, b) => a[1].date.getTime() - b[1].date.getTime())
    .map(([month, v]) => ({
      month,
      revenue: Math.round(v.revenue * 100) / 100,
      profit: Math.round(v.profit * 100) / 100,
      jobs: v.jobs,
    }));

  // Top products by margin
  const productMap = new Map<
    string,
    { revenue: number; profit: number; totalCost: number }
  >();
  jobCalcs.forEach((calc) => {
    if (!calc.hasRevenue) return;
    const existing = productMap.get(calc.productName);
    const cost = calc.filamentCost + calc.electricityCost + calc.laborCost + calc.platformFee;
    if (existing) {
      existing.revenue += calc.revenue;
      existing.profit += calc.profit;
      existing.totalCost += cost;
    } else {
      productMap.set(calc.productName, {
        revenue: calc.revenue,
        profit: calc.profit,
        totalCost: cost,
      });
    }
  });

  const topProducts = Array.from(productMap.entries())
    .map(([name, v]) => ({
      productName: name,
      totalRevenue: Math.round(v.revenue * 100) / 100,
      profit: Math.round(v.profit * 100) / 100,
      avgMarginPct: v.revenue > 0 ? Math.round((v.profit / v.revenue) * 10000) / 100 : 0,
    }))
    .sort((a, b) => b.avgMarginPct - a.avgMarginPct)
    .slice(0, 5);

  // Filament consumption
  const filamentMap = new Map<
    string,
    { brand: string; colorName: string; grams: number; colorHex: string }
  >();
  jobCalcs.forEach((calc) => {
    if (calc.gramsUsed <= 0) return;
    const existing = filamentMap.get(calc.filamentKey);
    if (existing) {
      existing.grams += calc.gramsUsed;
    } else {
      filamentMap.set(calc.filamentKey, {
        brand: calc.filamentBrand,
        colorName: calc.filamentColorName,
        grams: calc.gramsUsed,
        colorHex: calc.filamentColor,
      });
    }
  });

  const filamentUsage = Array.from(filamentMap.values())
    .map((v) => ({
      brand: v.brand,
      colorName: v.colorName,
      totalGrams: Math.round(v.grams * 10) / 10,
      colorHex: v.colorHex,
    }))
    .sort((a, b) => b.totalGrams - a.totalGrams);

  // Summary
  const totalRevenue = jobCalcs.reduce((s, c) => s + c.revenue, 0);
  const totalProfit = jobCalcs.reduce((s, c) => s + c.profit, 0);
  const overallMarginPct =
    totalRevenue > 0 ? Math.round((totalProfit / totalRevenue) * 10000) / 100 : 0;

  return Response.json({
    data: {
      monthlyRevenue: monthlyData,
      topProducts,
      filamentUsage,
      summary: {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalProfit: Math.round(totalProfit * 100) / 100,
        overallMarginPct,
        jobsCompleted: jobs.length,
      },
    },
  });
}
