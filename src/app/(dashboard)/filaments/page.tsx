import { PageHeader } from "@/components/shared/page-header";

export default function FilamentsPage() {
  return (
    <div>
      <PageHeader title="Filaments" description="Manage your filament inventory" />
      <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
        <p className="text-lg font-medium">Coming in Milestone 1</p>
        <p className="text-sm mt-1">Filament inventory management — add, edit, and track your spools.</p>
      </div>
    </div>
  );
}
