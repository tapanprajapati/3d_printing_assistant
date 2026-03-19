"use client";

import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useDeleteProduct } from "@/lib/hooks/use-products";
import { toast } from "sonner";

export interface Product {
  id: string;
  name: string;
  description: string | null;
  category: string;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  _count: { variants: number };
  assets?: { storagePath: string; fileName: string }[];
}

interface ProductCardProps {
  product: Product;
}

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  DRAFT: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  ARCHIVED: "bg-muted text-muted-foreground",
};

export function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const { mutate: deleteProduct, isPending: isDeleting } = useDeleteProduct();

  function handleDelete() {
    deleteProduct(product.id, {
      onSuccess: () => toast.success("Product deleted"),
      onError: () => toast.error("Failed to delete product"),
    });
  }

  const primaryImage = product.assets?.[0];

  return (
    <Card className="flex flex-col">
      {primaryImage && (
        <div className="w-full aspect-video overflow-hidden rounded-t-lg bg-muted">
          <img
            src={primaryImage.storagePath}
            alt={primaryImage.fileName}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-semibold truncate">{product.name}</p>
            {product.description && (
              <p className="text-sm text-muted-foreground truncate mt-0.5">{product.description}</p>
            )}
          </div>
          <span
            className={`shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[product.status] ?? ""}`}
          >
            {product.status}
          </span>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 flex-1">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{product.category}</Badge>
          <span className="text-sm text-muted-foreground">
            {product._count.variants} variant{product._count.variants !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="flex gap-2 mt-auto pt-1">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => router.push(`/products/${product.id}`)}
          >
            <Pencil className="h-3.5 w-3.5 mr-1" />
            Edit
          </Button>
          <ConfirmDialog
            trigger={
              <Button variant="outline" size="sm" disabled={isDeleting}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            }
            title="Delete product?"
            description={`This will permanently delete "${product.name}" and all its variants.`}
            onConfirm={handleDelete}
            isPending={isDeleting}
          />
        </div>
      </CardContent>
    </Card>
  );
}
