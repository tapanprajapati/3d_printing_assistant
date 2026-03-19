"use client";

import { usePrintJobs } from "@/lib/hooks/use-print-jobs";
import { KanbanColumn } from "@/components/print-jobs/kanban-column";
import { JobCard } from "@/components/print-jobs/job-card";
import { Skeleton } from "@/components/ui/skeleton";

interface KanbanBoardProps {
  showArchived: boolean;
}

export function KanbanBoard({ showArchived }: KanbanBoardProps) {
  const { data, isLoading } = usePrintJobs({ showArchived });
  const jobs = data?.data ?? [];

  const queued = jobs.filter((j: { status: string }) => j.status === "QUEUED");
  const inProgress = jobs.filter((j: { status: string }) => j.status === "IN_PROGRESS");
  const completed = jobs.filter((j: { status: string }) => j.status === "COMPLETED");
  const archived = jobs.filter(
    (j: { status: string }) => j.status === "FAILED" || j.status === "CANCELLED"
  );

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[0, 1, 2].map((i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-40 rounded-lg" />
            <Skeleton className="h-40 rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KanbanColumn title="Queued" count={queued.length} emptyMessage="No jobs queued">
          {queued.map((job: Parameters<typeof JobCard>[0]["job"]) => (
            <JobCard key={job.id} job={job} />
          ))}
        </KanbanColumn>

        <KanbanColumn title="In Progress" count={inProgress.length} emptyMessage="Nothing printing">
          {inProgress.map((job: Parameters<typeof JobCard>[0]["job"]) => (
            <JobCard key={job.id} job={job} />
          ))}
        </KanbanColumn>

        <KanbanColumn title="Completed" count={completed.length} emptyMessage="No completed jobs">
          {completed.map((job: Parameters<typeof JobCard>[0]["job"]) => (
            <JobCard key={job.id} job={job} />
          ))}
        </KanbanColumn>
      </div>

      {showArchived && archived.length > 0 && (
        <div>
          <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-3">
            Archived ({archived.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {archived.map((job: Parameters<typeof JobCard>[0]["job"]) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
