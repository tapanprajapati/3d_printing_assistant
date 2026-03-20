import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const filaments = await prisma.filament.findMany({
    select: { remainingWeightG: true, lowStockThresholdG: true },
  });

  const lowStockCount = filaments.filter(
    (f) => f.remainingWeightG < (f.lowStockThresholdG ?? 100)
  ).length;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar lowStockCount={lowStockCount} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6">
          {children}
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
