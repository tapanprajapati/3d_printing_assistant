import { PageHeader } from "@/components/shared/page-header";

export default function PrintQueuePage() {
  return (
    <div>
      <PageHeader title="Print Queue" description="Track your print jobs" />
      <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
        <p className="text-lg font-medium">Coming in Milestone 3</p>
        <p className="text-sm mt-1">Kanban-style print job tracking with filament usage logging.</p>
      </div>
    </div>
  );
}
