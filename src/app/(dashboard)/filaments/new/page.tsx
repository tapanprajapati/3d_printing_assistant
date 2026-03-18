"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { FilamentForm } from "@/components/filaments/filament-form";
import { useCreateFilament } from "@/lib/hooks/use-filaments";
import { toast } from "sonner";
import type { FilamentInput } from "@/lib/validations/filament";

export default function NewFilamentPage() {
  const router = useRouter();
  const { mutate: createFilament, isPending } = useCreateFilament();

  function handleSubmit(data: FilamentInput) {
    createFilament(data, {
      onSuccess: () => {
        toast.success("Filament added!");
        router.push("/filaments");
      },
      onError: () => toast.error("Failed to create filament"),
    });
  }

  return (
    <div>
      <PageHeader title="New Filament" description="Add a new spool to your inventory" />
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Filament Details</CardTitle>
        </CardHeader>
        <CardContent>
          <FilamentForm
            onSubmit={handleSubmit}
            isPending={isPending}
            submitLabel="Add Filament"
          />
        </CardContent>
      </Card>
    </div>
  );
}
