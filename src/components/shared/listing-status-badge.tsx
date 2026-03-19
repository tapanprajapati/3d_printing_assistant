import { Badge } from "@/components/ui/badge";

type ListingStatus = "DRAFT" | "ACTIVE" | "INACTIVE" | "SOLD_OUT";

const statusConfig: Record<ListingStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  ACTIVE: { label: "Active", variant: "default" },
  DRAFT: { label: "Draft", variant: "secondary" },
  INACTIVE: { label: "Inactive", variant: "outline" },
  SOLD_OUT: { label: "Sold Out", variant: "destructive" },
};

export function ListingStatusBadge({ status }: { status: string }) {
  const config = statusConfig[status as ListingStatus] ?? { label: status, variant: "secondary" as const };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
