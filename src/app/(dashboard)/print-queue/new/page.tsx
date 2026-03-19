"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { PrintJobForm } from "@/components/print-jobs/print-job-form";
import { useCreatePrintJob } from "@/lib/hooks/use-print-jobs";
import { toast } from "sonner";
import type { PrintJobInput } from "@/lib/validations/print-job";

export default function NewPrintJobPage() {
  const router = useRouter();
  const { mutate: createJob, isPending } = useCreatePrintJob();

  function handleSubmit(values: PrintJobInput) {
    createJob(values, {
      onSuccess: () => {
        toast.success("Print job added to queue");
        router.push("/print-queue");
      },
      onError: () => toast.error("Failed to create print job"),
    });
  }

  return (
    <div>
      <PageHeader title="New Print Job" description="Add a job to your print queue" />

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Job Details</CardTitle>
        </CardHeader>
        <CardContent>
          <PrintJobForm
            onSubmit={handleSubmit}
            isPending={isPending}
            submitLabel="Add to Queue"
          />
        </CardContent>
      </Card>
    </div>
  );
}
