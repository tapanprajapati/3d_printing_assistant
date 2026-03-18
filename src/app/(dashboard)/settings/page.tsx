import { PageHeader } from "@/components/shared/page-header";

export default function SettingsPage() {
  return (
    <div>
      <PageHeader title="Settings" description="Configure app defaults" />
      <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
        <p className="text-lg font-medium">Coming in Milestone 4</p>
        <p className="text-sm mt-1">App settings — electricity rate, printer wattage, labor rate, and more.</p>
      </div>
    </div>
  );
}
