"use client";

import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboard } from "@/lib/hooks/use-dashboard";

const STATUS_VARIANT: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  QUEUED: "secondary",
  IN_PROGRESS: "default",
  COMPLETED: "outline",
  FAILED: "destructive",
  CANCELLED: "destructive",
};

const STATUS_CLASS: Record<string, string> = {
  COMPLETED:
    "text-green-700 border-green-300 bg-green-50 dark:bg-green-950 dark:text-green-300",
};

interface LowStockFilament {
  id: string;
  brand: string;
  colorName: string;
  colorHex: string;
  remainingWeightG: number;
  totalWeightG: number;
  lowStockThresholdG: number | null;
}

interface RecentJob {
  id: string;
  title: string;
  status: string;
  gramsUsed: number | null;
  estimatedHours: number | null;
}

interface DashboardData {
  totalFilaments: number;
  lowStockFilaments: LowStockFilament[];
  activeListings: number;
  productsByStatus: { active: number; draft: number; archived: number };
  jobsThisMonth: { queued: number; inProgress: number; completed: number };
  recentJobs: RecentJob[];
}

function StatCard({
  title,
  value,
  valueClass,
  subText,
}: {
  title: string;
  value: number | string;
  valueClass?: string;
  subText?: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className={`text-3xl font-bold ${valueClass ?? ""}`}>{value}</p>
        {subText && (
          <p className="mt-1 text-xs text-muted-foreground">{subText}</p>
        )}
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { data: response, isLoading } = useDashboard();
  const data = response?.data as DashboardData | undefined;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="At-a-glance overview of your 3D printing business"
      />

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {isLoading ? (
          <>
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
          <>
            <StatCard
              title="Total Filaments"
              value={data?.totalFilaments ?? 0}
            />
            <StatCard
              title="Low Stock Alerts"
              value={data?.lowStockFilaments.length ?? 0}
              valueClass={
                (data?.lowStockFilaments.length ?? 0) > 0
                  ? "text-destructive"
                  : undefined
              }
            />
            <StatCard
              title="Active Listings"
              value={data?.activeListings ?? 0}
            />
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Products
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {data?.productsByStatus.active ?? 0}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Draft: {data?.productsByStatus.draft ?? 0} | Archived:{" "}
                  {data?.productsByStatus.archived ?? 0}
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Jobs This Month */}
      {isLoading ? (
        <Card>
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 divide-x">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="px-4 first:pl-0 last:pr-0">
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-8 w-12" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Jobs This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 divide-x">
              <div className="pr-4">
                <p className="text-xs text-muted-foreground mb-1">Queued</p>
                <p className="text-2xl font-bold">
                  {data?.jobsThisMonth.queued ?? 0}
                </p>
              </div>
              <div className="px-4">
                <p className="text-xs text-muted-foreground mb-1">In Progress</p>
                <p className="text-2xl font-bold">
                  {data?.jobsThisMonth.inProgress ?? 0}
                </p>
              </div>
              <div className="pl-4">
                <p className="text-xs text-muted-foreground mb-1">Completed</p>
                <p className="text-2xl font-bold">
                  {data?.jobsThisMonth.completed ?? 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Button asChild variant="outline">
              <Link href="/filaments/new">Add Filament</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/products/new">Add Product</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/print-queue/new">New Print Job</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/calculator">Open Calculator</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Detail panels */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Print Jobs */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Print Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : (data?.recentJobs.length ?? 0) === 0 ? (
              <p className="text-sm text-muted-foreground">
                No print jobs yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-muted-foreground">
                      <th className="pb-2 text-left font-medium">Title</th>
                      <th className="pb-2 text-left font-medium">Status</th>
                      <th className="pb-2 text-right font-medium">
                        Filament (g)
                      </th>
                      <th className="pb-2 text-right font-medium">
                        Est. Hours
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {data?.recentJobs.map((job) => (
                      <tr key={job.id} className="py-2">
                        <td className="py-2 pr-4 font-medium">{job.title}</td>
                        <td className="py-2 pr-4">
                          <Badge
                            variant={
                              STATUS_VARIANT[job.status] ?? "secondary"
                            }
                            className={STATUS_CLASS[job.status]}
                          >
                            {job.status.replace("_", " ")}
                          </Badge>
                        </td>
                        <td className="py-2 text-right text-muted-foreground">
                          {job.gramsUsed != null ? `${job.gramsUsed}g` : "—"}
                        </td>
                        <td className="py-2 text-right text-muted-foreground">
                          {job.estimatedHours != null
                            ? `${job.estimatedHours}h`
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Low Stock Filaments */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Low Stock Filaments</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="space-y-1">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-2 w-full" />
                  </div>
                ))}
              </div>
            ) : (data?.lowStockFilaments.length ?? 0) === 0 ? (
              <p className="text-sm text-muted-foreground">
                All filaments well stocked.
              </p>
            ) : (
              <div className="space-y-4">
                {data?.lowStockFilaments.map((f) => {
                  const pct = Math.round(
                    (f.remainingWeightG / f.totalWeightG) * 100,
                  );
                  return (
                    <div key={f.id} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span
                            className="inline-block h-3 w-3 rounded-full border"
                            style={{ backgroundColor: f.colorHex }}
                          />
                          <span className="font-medium">
                            {f.brand} {f.colorName}
                          </span>
                        </div>
                        <span className="text-muted-foreground">
                          {f.remainingWeightG}g / {f.totalWeightG}g
                        </span>
                      </div>
                      <Progress value={pct} className="h-2" />
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
