import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

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
  COMPLETED: "text-green-700 border-green-300 bg-green-50 dark:bg-green-950 dark:text-green-300",
};

export default async function DashboardPage() {
  const [filaments, activeProducts, pendingJobs, recentJobs] =
    await Promise.all([
      prisma.filament.findMany({
        select: {
          id: true,
          spoolCount: true,
          remainingWeightG: true,
          totalWeightG: true,
          lowStockThresholdG: true,
          brand: true,
          colorName: true,
          colorHex: true,
        },
      }),
      prisma.product.count({ where: { status: "ACTIVE" } }),
      prisma.printJob.count({
        where: { status: { in: ["QUEUED", "IN_PROGRESS"] } },
      }),
      prisma.printJob.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          status: true,
          gramsUsed: true,
          estimatedHours: true,
        },
      }),
    ]);

  const totalSpools = filaments.reduce((s, f) => s + f.spoolCount, 0);
  const lowStock = filaments.filter(
    (f) =>
      f.lowStockThresholdG !== null &&
      f.remainingWeightG < f.lowStockThresholdG,
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="At-a-glance overview of your 3D printing business"
      />

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard title="Filament Spools" value={totalSpools} />
        <StatCard
          title="Low Stock Alerts"
          value={lowStock.length}
          valueClass={lowStock.length > 0 ? "text-destructive" : undefined}
        />
        <StatCard title="Active Products" value={activeProducts} />
        <StatCard title="Jobs In Progress" value={pendingJobs} />
      </div>

      {/* Detail panels */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Print Jobs */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Print Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            {recentJobs.length === 0 ? (
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
                    {recentJobs.map((job) => (
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
                          {job.gramsUsed != null
                            ? `${job.gramsUsed}g`
                            : "—"}
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
            {lowStock.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                All filaments well stocked.
              </p>
            ) : (
              <div className="space-y-4">
                {lowStock.map((f) => {
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

function StatCard({
  title,
  value,
  valueClass,
}: {
  title: string;
  value: number;
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
        <p className={`text-3xl font-bold ${valueClass ?? ""}`}>{value}</p>
      </CardContent>
    </Card>
  );
}
