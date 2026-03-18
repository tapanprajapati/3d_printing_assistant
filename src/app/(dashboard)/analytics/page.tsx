import { PageHeader } from "@/components/shared/page-header";

export default function AnalyticsPage() {
  return (
    <div>
      <PageHeader title="Analytics" description="Business performance overview" />
      <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
        <p className="text-lg font-medium">Coming in Milestone 4</p>
        <p className="text-sm mt-1">Revenue charts, profit analytics, and top product rankings.</p>
      </div>
    </div>
  );
}
