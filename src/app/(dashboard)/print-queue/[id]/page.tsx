"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PrintJobForm } from "@/components/print-jobs/print-job-form";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { usePrintJob, useUpdatePrintJob, useDeletePrintJob } from "@/lib/hooks/use-print-jobs";
import { toast } from "sonner";
import type { PrintJobInput } from "@/lib/validations/print-job";

export default function PrintJobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data, isLoading } = usePrintJob(id);
  const { mutate: updateJob, isPending: isUpdating } = useUpdatePrintJob();
  const { mutate: deleteJob, isPending: isDeleting } = useDeletePrintJob();

  const job = data?.data;

  function handleSubmit(values: PrintJobInput) {
    updateJob(
      { id, data: values },
      {
        onSuccess: () => toast.success("Job updated!"),
        onError: () => toast.error("Failed to update job"),
      }
    );
  }

  function handleDelete() {
    deleteJob(id, {
      onSuccess: () => {
        toast.success("Job deleted");
        router.push("/print-queue");
      },
      onError: () => toast.error("Failed to delete job"),
    });
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 rounded-lg" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Print job not found.</p>
        <Button variant="link" onClick={() => router.push("/print-queue")}>
          Back to Queue
        </Button>
      </div>
    );
  }

  const usageLogs: Array<{ id: string; loggedAt: string; gramsUsed: number; note?: string | null }> =
    job.usageLogs ?? [];

  return (
    <div>
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/print-queue">Print Queue</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{job.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">{job.title}</h1>
        <p className="text-sm text-muted-foreground mt-1">Status: {job.status}</p>
      </div>

      <Tabs defaultValue="details">
        <TabsList className="mb-6">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="usage">Usage Log</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          {/* Edit form */}
          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
            </CardHeader>
            <CardContent>
              <PrintJobForm
                defaultValues={{
                  title: job.title,
                  productId: job.productId ?? undefined,
                  variantId: job.variantId ?? undefined,
                  filamentId: job.filamentId ?? undefined,
                  estimatedHours: job.estimatedHours ?? undefined,
                  scheduledAt: job.scheduledAt ?? undefined,
                  notes: job.notes ?? "",
                }}
                onSubmit={handleSubmit}
                isPending={isUpdating}
                submitLabel="Save Changes"
              />
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {job.scheduledAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Scheduled</span>
                  <span>{new Date(job.scheduledAt).toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created</span>
                <span>{new Date(job.createdAt).toLocaleString()}</span>
              </div>
              {job.startedAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Started</span>
                  <span>{new Date(job.startedAt).toLocaleString()}</span>
                </div>
              )}
              {job.completedAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Completed</span>
                  <span>{new Date(job.completedAt).toLocaleString()}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Delete */}
          <div className="max-w-2xl">
            <ConfirmDialog
              trigger={
                <Button variant="destructive" size="sm" disabled={isDeleting}>
                  Delete Job
                </Button>
              }
              title="Delete this job?"
              description={`"${job.title}" will be permanently deleted. This cannot be undone.`}
              onConfirm={handleDelete}
              isPending={isDeleting}
            />
          </div>
        </TabsContent>

        <TabsContent value="usage">
          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle>Filament Usage Log</CardTitle>
            </CardHeader>
            <CardContent>
              {usageLogs.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No filament usage recorded for this job.
                </p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-muted-foreground">
                      <th className="text-left pb-2 font-medium">Logged At</th>
                      <th className="text-right pb-2 font-medium">Grams Used</th>
                      <th className="text-left pb-2 font-medium pl-4">Note</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usageLogs.map((log) => (
                      <tr key={log.id} className="border-b last:border-0">
                        <td className="py-2">{new Date(log.loggedAt).toLocaleString()}</td>
                        <td className="py-2 text-right">{log.gramsUsed}g</td>
                        <td className="py-2 pl-4 text-muted-foreground">{log.note ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
