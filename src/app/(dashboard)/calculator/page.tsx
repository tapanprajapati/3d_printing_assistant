import { PageHeader } from "@/components/shared/page-header";

export default function CalculatorPage() {
  return (
    <div>
      <PageHeader title="Calculator" description="Calculate print costs and margins" />
      <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
        <p className="text-lg font-medium">Coming in Milestone 3</p>
        <p className="text-sm mt-1">Cost and margin calculator — filament, electricity, labor, and platform fees.</p>
      </div>
    </div>
  );
}
