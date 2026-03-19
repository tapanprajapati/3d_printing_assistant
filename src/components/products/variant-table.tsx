"use client";

import { useState } from "react";
import Link from "next/link";
import { Pencil, Trash2, ExternalLink, Plus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { VariantForm } from "@/components/products/variant-form";
import {
  useProductVariants,
  useCreateVariant,
  useUpdateVariant,
  useDeleteVariant,
} from "@/lib/hooks/use-products";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import type { ProductVariantInput } from "@/lib/validations/product";

interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  sellingPrice: number;
  materialCostG: number;
  printTimeHours: number;
  notes: string | null;
}

interface VariantTableProps {
  productId: string;
}

export function VariantTable({ productId }: VariantTableProps) {
  const { data, isLoading } = useProductVariants(productId);
  const { mutate: createVariant, isPending: isCreating } = useCreateVariant(productId);
  const { mutate: updateVariant, isPending: isUpdating } = useUpdateVariant(productId);
  const { mutate: deleteVariant, isPending: isDeleting } = useDeleteVariant(productId);

  const [addOpen, setAddOpen] = useState(false);
  const [editVariant, setEditVariant] = useState<ProductVariant | null>(null);

  const variants = (data?.data ?? []) as ProductVariant[];

  function handleCreate(values: ProductVariantInput) {
    createVariant(values, {
      onSuccess: () => {
        toast.success("Variant added");
        setAddOpen(false);
      },
      onError: (err) => toast.error(err.message ?? "Failed to add variant"),
    });
  }

  function handleUpdate(values: ProductVariantInput) {
    if (!editVariant) return;
    updateVariant(
      { variantId: editVariant.id, data: values },
      {
        onSuccess: () => {
          toast.success("Variant updated");
          setEditVariant(null);
        },
        onError: () => toast.error("Failed to update variant"),
      }
    );
  }

  function handleDelete(variantId: string) {
    deleteVariant(variantId, {
      onSuccess: () => toast.success("Variant deleted"),
      onError: () => toast.error("Failed to delete variant"),
    });
  }

  if (isLoading) {
    return <Skeleton className="h-40 rounded-lg" />;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Material (g)</TableHead>
              <TableHead className="text-right">Print Time (h)</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {variants.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No variants yet. Add one below.
                </TableCell>
              </TableRow>
            ) : (
              variants.map((v) => (
                <TableRow key={v.id}>
                  <TableCell className="font-medium">{v.name}</TableCell>
                  <TableCell className="font-mono text-sm">{v.sku}</TableCell>
                  <TableCell className="text-right">${v.sellingPrice.toFixed(2)}</TableCell>
                  <TableCell className="text-right">{v.materialCostG}g</TableCell>
                  <TableCell className="text-right">{v.printTimeHours}h</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setEditVariant(v)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                        <Link href={`/calculator?variantId=${v.id}`}>
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                      <ConfirmDialog
                        trigger={
                          <Button variant="ghost" size="icon" className="h-8 w-8" disabled={isDeleting}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        }
                        title="Delete variant?"
                        description={`This will permanently delete the variant "${v.name}" (${v.sku}).`}
                        onConfirm={() => handleDelete(v.id)}
                        isPending={isDeleting}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Button variant="outline" size="sm" onClick={() => setAddOpen(true)}>
        <Plus className="h-4 w-4 mr-1" />
        Add Variant
      </Button>

      {/* Add Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Variant</DialogTitle>
          </DialogHeader>
          <VariantForm onSubmit={handleCreate} isPending={isCreating} submitLabel="Add Variant" />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editVariant} onOpenChange={(open) => !open && setEditVariant(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Variant</DialogTitle>
          </DialogHeader>
          {editVariant && (
            <VariantForm
              defaultValues={{
                name: editVariant.name,
                sku: editVariant.sku,
                sellingPrice: editVariant.sellingPrice,
                materialCostG: editVariant.materialCostG,
                printTimeHours: editVariant.printTimeHours,
                notes: editVariant.notes ?? "",
              }}
              onSubmit={handleUpdate}
              isPending={isUpdating}
              submitLabel="Save Changes"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
