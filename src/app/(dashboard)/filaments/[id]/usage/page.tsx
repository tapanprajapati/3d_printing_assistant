"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { UsageLogTable } from "@/components/filaments/usage-log-table";
import {
  useFilament,
  useFilamentUsageLogs,
  useAddUsageLog,
} from "@/lib/hooks/use-filaments";
import { UsageLogSchema, type UsageLogInput } from "@/lib/validations/filament";
import { toast } from "sonner";

export default function FilamentUsagePage() {
  const { id } = useParams<{ id: string }>();
  const [page, setPage] = useState(1);

  const { data: filamentData, isLoading: filamentLoading } = useFilament(id);
  const { data: logsData, isLoading: logsLoading } = useFilamentUsageLogs(id, page);
  const { mutate: addLog, isPending: isAdding } = useAddUsageLog(id);

  const form = useForm<UsageLogInput>({
    resolver: zodResolver(UsageLogSchema),
    defaultValues: { gramsUsed: 0, note: "" },
  });

  function handleAddLog(values: UsageLogInput) {
    addLog(values, {
      onSuccess: () => {
        toast.success("Usage logged!");
        form.reset({ gramsUsed: 0, note: "" });
      },
      onError: () => toast.error("Failed to log usage"),
    });
  }

  const filament = filamentData?.data;
  const logs = logsData?.data ?? [];
  const total = logsData?.total ?? 0;
  const label = filament ? `${filament.brand} ${filament.colorName}` : "…";

  if (filamentLoading) {
    return <Skeleton className="h-96 rounded-lg" />;
  }

  return (
    <div>
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/filaments">Filaments</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={`/filaments/${id}`}>{label}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Usage Log</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h1 className="text-2xl font-bold tracking-tight mb-1">{label}</h1>
      {filament && (
        <p className="text-sm text-muted-foreground mb-6">
          Remaining: <strong>{filament.remainingWeightG}g</strong> of {filament.totalWeightG}g
        </p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add Manual Entry */}
        <Card className="lg:col-span-1 h-fit">
          <CardHeader>
            <CardTitle className="text-base">Add Manual Entry</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleAddLog)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="gramsUsed"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Grams Used</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0.1}
                          step={0.1}
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="note"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Note <span className="text-muted-foreground font-normal">optional</span></FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Calibration print" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isAdding} className="w-full">
                  {isAdding ? "Logging…" : "Log Usage"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Usage Log Table */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Usage History</CardTitle>
          </CardHeader>
          <CardContent>
            {logsLoading ? (
              <Skeleton className="h-48 rounded" />
            ) : (
              <UsageLogTable
                logs={logs}
                total={total}
                page={page}
                onPageChange={setPage}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
