"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useAnalytics } from "@/lib/hooks/use-analytics";
import { RevenueChart } from "@/components/analytics/revenue-chart";
import { FilamentPieChart } from "@/components/analytics/filament-pie-chart";
import { TopProductsTable } from "@/components/analytics/top-products-table";

const currentYear = new Date().getFullYear();
const lastYear = currentYear - 1;

function StatCard({
  title,
  value,
  valueClass,
}: {
  title: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className={`text-2xl font-bold ${valueClass ?? ""}`}>{value}</p>
      </CardContent>
    </Card>
  );
}

function StatCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <Skeleton className="h-4 w-28" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-20" />
      </CardContent>
    </Card>
  );
}

export default function AnalyticsPage() {
  const [from, setFrom] = useState(`${currentYear}-01-01`);
  const [to, setTo] = useState(`${currentYear}-12-31`);

  const { data: response, isLoading } = useAnalytics(from, to);
  const data = response?.data;
  const summary = data?.summary;
  const isEmpty = !isLoading && (summary?.jobsCompleted ?? 0) === 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <PageHeader
          title="Analytics"
          description="Business performance overview"
        />
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setFrom(`${currentYear}-01-01`);
              setTo(`${currentYear}-12-31`);
            }}
          >
            This Year
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setFrom(`${lastYear}-01-01`);
              setTo(`${lastYear}-12-31`);
            }}
          >
            Last Year
          </Button>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="h-8 w-36"
            />
            <span>—</span>
            <Input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="h-8 w-36"
            />
          </div>
        </div>
      </div>

      {/* Summary stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {isLoading ? (
          <>
            {[...Array(4)].map((_, i) => (
              <StatCardSkeleton key={i} />
            ))}
          </>
        ) : (
          <>
            <StatCard
              title="Total Revenue"
              value={`$${(summary?.totalRevenue ?? 0).toFixed(2)}`}
            />
            <StatCard
              title="Total Profit"
              value={`$${(summary?.totalProfit ?? 0).toFixed(2)}`}
              valueClass={
                (summary?.totalProfit ?? 0) >= 0
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }
            />
            <StatCard
              title="Overall Margin"
              value={`${(summary?.overallMarginPct ?? 0).toFixed(1)}%`}
              valueClass={
                (summary?.overallMarginPct ?? 0) >= 30
                  ? "text-green-600 dark:text-green-400"
                  : (summary?.overallMarginPct ?? 0) >= 10
                  ? "text-yellow-600 dark:text-yellow-400"
                  : "text-muted-foreground"
              }
            />
            <StatCard
              title="Jobs Completed"
              value={String(summary?.jobsCompleted ?? 0)}
            />
          </>
        )}
      </div>

      {isEmpty ? (
        <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">
          <p className="text-lg font-medium">No completed jobs in this period</p>
          <p className="text-sm mt-1">
            Adjust the date range or complete some print jobs to see analytics.
          </p>
        </div>
      ) : (
        <>
          {/* Revenue chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Revenue &amp; Profit by Month</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : (
                <RevenueChart data={data?.monthlyRevenue ?? []} />
              )}
            </CardContent>
          </Card>

          {/* Filament + Top Products */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Filament Consumption</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-[300px] w-full" />
                ) : (
                  <FilamentPieChart
                    data={(data?.filamentUsage ?? []).map((f) => ({
                      name: `${f.brand} ${f.colorName}`,
                      totalGrams: f.totalGrams,
                      colorHex: f.colorHex,
                    }))}
                  />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Top Products by Margin</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-8 w-full" />
                    ))}
                  </div>
                ) : (
                  <TopProductsTable data={data?.topProducts ?? []} />
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
