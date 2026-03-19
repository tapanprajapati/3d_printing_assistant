"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { KanbanBoard } from "@/components/print-jobs/kanban-board";

export default function PrintQueuePage() {
  const [showArchived, setShowArchived] = useState(false);

  return (
    <div>
      <PageHeader title="Print Queue" description="Manage your active print jobs">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowArchived((v) => !v)}
        >
          {showArchived ? "Hide Archived" : "Show Archived"}
        </Button>
        <Button asChild size="sm">
          <Link href="/print-queue/new">+ New Job</Link>
        </Button>
      </PageHeader>

      <KanbanBoard showArchived={showArchived} />
    </div>
  );
}
