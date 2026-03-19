import { Badge } from "@/components/ui/badge";

interface KanbanColumnProps {
  title: string;
  count: number;
  emptyMessage: string;
  children?: React.ReactNode;
}

export function KanbanColumn({ title, count, emptyMessage, children }: KanbanColumnProps) {
  return (
    <div className="flex flex-col min-h-[400px]">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
          {title}
        </h2>
        <Badge variant="secondary">{count}</Badge>
      </div>
      <div className="flex flex-col gap-3 flex-1">
        {count === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">{emptyMessage}</p>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
