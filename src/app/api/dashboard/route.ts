import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const now = new Date();
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

  const [
    totalFilaments,
    allFilaments,
    activeListings,
    activeProducts,
    draftProducts,
    archivedProducts,
    queuedJobs,
    inProgressJobs,
    completedJobs,
    recentJobs,
  ] = await Promise.all([
    prisma.filament.count(),
    prisma.filament.findMany({
      select: {
        id: true,
        brand: true,
        colorName: true,
        colorHex: true,
        remainingWeightG: true,
        totalWeightG: true,
        lowStockThresholdG: true,
      },
    }),
    prisma.marketplaceListing.count({ where: { status: "ACTIVE" } }),
    prisma.product.count({ where: { status: "ACTIVE" } }),
    prisma.product.count({ where: { status: "DRAFT" } }),
    prisma.product.count({ where: { status: "ARCHIVED" } }),
    prisma.printJob.count({
      where: { status: "QUEUED", createdAt: { gte: monthStart } },
    }),
    prisma.printJob.count({
      where: { status: "IN_PROGRESS", createdAt: { gte: monthStart } },
    }),
    prisma.printJob.count({
      where: { status: "COMPLETED", createdAt: { gte: monthStart } },
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

  const lowStockFilaments = allFilaments.filter(
    (f) => f.remainingWeightG < (f.lowStockThresholdG ?? 100),
  );

  return Response.json({
    data: {
      totalFilaments,
      lowStockFilaments,
      activeListings,
      productsByStatus: {
        active: activeProducts,
        draft: draftProducts,
        archived: archivedProducts,
      },
      jobsThisMonth: {
        queued: queuedJobs,
        inProgress: inProgressJobs,
        completed: completedJobs,
      },
      recentJobs,
    },
  });
}
