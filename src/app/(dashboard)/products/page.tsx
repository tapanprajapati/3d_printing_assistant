import { PageHeader } from "@/components/shared/page-header";

export default function ProductsPage() {
  return (
    <div>
      <PageHeader title="Products" description="Manage your product catalog" />
      <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
        <p className="text-lg font-medium">Coming in Milestone 2</p>
        <p className="text-sm mt-1">Product catalog — variants, assets, and marketplace listings.</p>
      </div>
    </div>
  );
}
