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
import { FilamentForm } from "@/components/filaments/filament-form";
import { useFilament, useUpdateFilament } from "@/lib/hooks/use-filaments";
import { toast } from "sonner";
import type { FilamentInput } from "@/lib/validations/filament";

export default function EditFilamentPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data, isLoading } = useFilament(id);
  const { mutate: updateFilament, isPending } = useUpdateFilament();

  const filament = data?.data;

  function handleSubmit(values: FilamentInput) {
    updateFilament(
      { id, data: values },
      {
        onSuccess: () => toast.success("Filament updated!"),
        onError: () => toast.error("Failed to update filament"),
      }
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 rounded-lg" />
      </div>
    );
  }

  if (!filament) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Filament not found.</p>
        <Button variant="link" onClick={() => router.push("/filaments")}>
          Back to Filaments
        </Button>
      </div>
    );
  }

  const label = `${filament.brand} ${filament.colorName}`;

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
            <BreadcrumbPage>{label}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{label}</h1>
          <p className="text-sm text-muted-foreground mt-1">Edit filament details</p>
        </div>
        <Button variant="outline" asChild>
          <Link href={`/filaments/${id}/usage`}>View Usage Log</Link>
        </Button>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Filament Details</CardTitle>
        </CardHeader>
        <CardContent>
          <FilamentForm
            defaultValues={filament}
            onSubmit={handleSubmit}
            isPending={isPending}
            submitLabel="Save Changes"
          />
        </CardContent>
      </Card>
    </div>
  );
}
