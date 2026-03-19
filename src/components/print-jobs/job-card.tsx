"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ColorSwatch } from "@/components/filaments/color-swatch";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { CompleteDialog } from "@/components/print-jobs/complete-dialog";
import { useUpdatePrintJob } from "@/lib/hooks/use-print-jobs";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface PrintJobCardJob {
  id: string;
  title: string;
  status: string;
  estimatedHours?: number | null;
  actualHours?: number | null;
  scheduledAt?: string | null;
  notes?: string | null;
  product?: { id: string; name: string } | null;
  variant?: { id: string; name: string } | null;
  filament?: { id: string; brand: string; colorName: string; colorHex: string; type: string } | null;
}

interface JobCardProps {
  job: PrintJobCardJob;
}

const STATUS_BADGE: Record<string, { label: string; variant: "secondary" | "default" | "outline" | "destructive" }> = {
  QUEUED: { label: "Queued", variant: "secondary" },
  IN_PROGRESS: { label: "In Progress", variant: "default" },
  COMPLETED: { label: "Completed", variant: "outline" },
  FAILED: { label: "Failed", variant: "destructive" },
  CANCELLED: { label: "Cancelled", variant: "destructive" },
};

export function JobCard({ job }: JobCardProps) {
  const queryClient = useQueryClient();
  const { mutate: updateJob, isPending } = useUpdatePrintJob();
  const [completeOpen, setCompleteOpen] = useState(false);

  const badge = STATUS_BADGE[job.status] ?? { label: job.status, variant: "secondary" as const };

  function transition(status: string) {
    updateJob(
      { id: job.id, data: { status: status as "QUEUED" | "IN_PROGRESS" | "COMPLETED" | "FAILED" | "CANCELLED" } },
      {
        onSuccess: () => toast.success(`Job marked as ${status.toLowerCase().replace("_", " ")}`),
        onError: (err) => toast.error(err.message),
      }
    );
  }

  function handleComplete(actualHours: number, gramsUsed?: number) {
    updateJob(
      {
        id: job.id,
        data: {
          status: "COMPLETED",
          actualHours,
          gramsUsed,
        },
      },
      {
        onSuccess: () => {
          toast.success("Job completed!");
          setCompleteOpen(false);
          if (gramsUsed && gramsUsed > 0) {
            queryClient.invalidateQueries({ queryKey: ["filaments"] });
          }
        },
        onError: (err) => toast.error(err.message),
      }
    );
  }

  return (
    <>
      <Card className="flex flex-col">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <p className="font-semibold text-sm truncate flex-1">{job.title}</p>
            <Badge variant={badge.variant} className="shrink-0 text-xs">
              {badge.label}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="pb-2 flex-1 space-y-1.5 text-sm text-muted-foreground">
          {job.product && (
            <p className="truncate">
              <span className="font-medium text-foreground">{job.product.name}</span>
              {job.variant && <span> — {job.variant.name}</span>}
            </p>
          )}

          {job.filament && (
            <div className="flex items-center gap-1.5">
              <ColorSwatch hex={job.filament.colorHex} size="sm" />
              <span className="truncate">
                {job.filament.brand} {job.filament.colorName}
              </span>
            </div>
          )}

          {(job.estimatedHours != null || job.actualHours != null) && (
            <p>
              {job.estimatedHours != null && (
                <span>Est. {job.estimatedHours}h</span>
              )}
              {job.actualHours != null && (
                <span className="ml-1">· Actual {job.actualHours}h</span>
              )}
            </p>
          )}

          {job.scheduledAt && (
            <p>
              Scheduled:{" "}
              {new Date(job.scheduledAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          )}

          {job.notes && (
            <p className="truncate italic">{job.notes}</p>
          )}
        </CardContent>

        <CardFooter className="pt-2 flex flex-wrap gap-2">
          {job.status === "QUEUED" && (
            <>
              <Button size="sm" onClick={() => transition("IN_PROGRESS")} disabled={isPending}>
                Start Print
              </Button>
              <ConfirmDialog
                trigger={
                  <Button size="sm" variant="outline" disabled={isPending}>
                    Cancel
                  </Button>
                }
                title="Cancel this job?"
                description={`"${job.title}" will be marked as cancelled.`}
                onConfirm={() => transition("CANCELLED")}
                isPending={isPending}
              />
            </>
          )}

          {job.status === "IN_PROGRESS" && (
            <>
              <Button size="sm" onClick={() => setCompleteOpen(true)} disabled={isPending}>
                Complete
              </Button>
              <ConfirmDialog
                trigger={
                  <Button size="sm" variant="outline" disabled={isPending}>
                    Mark Failed
                  </Button>
                }
                title="Mark as failed?"
                description={`"${job.title}" will be marked as failed.`}
                onConfirm={() => transition("FAILED")}
                isPending={isPending}
              />
              <ConfirmDialog
                trigger={
                  <Button size="sm" variant="ghost" disabled={isPending}>
                    Cancel
                  </Button>
                }
                title="Cancel this job?"
                description={`"${job.title}" will be marked as cancelled.`}
                onConfirm={() => transition("CANCELLED")}
                isPending={isPending}
              />
            </>
          )}

          {(job.status === "COMPLETED" || job.status === "FAILED" || job.status === "CANCELLED") && (
            <Button size="sm" variant="outline" asChild>
              <Link href={`/print-queue/${job.id}`}>View Details</Link>
            </Button>
          )}
        </CardFooter>
      </Card>

      <CompleteDialog
        jobId={job.id}
        jobTitle={job.title}
        open={completeOpen}
        onOpenChange={setCompleteOpen}
        onConfirm={handleComplete}
        isPending={isPending}
      />
    </>
  );
}
