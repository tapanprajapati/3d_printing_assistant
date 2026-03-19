"use client";

import { useRouter } from "next/navigation";
import { Package, Pencil, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useDeleteProduct } from "@/lib/hooks/use-products";
import { toast } from "sonner";
import type { Product } from "@/components/products/product-card";

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  DRAFT: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  ARCHIVED: "bg-muted text-muted-foreground",
};

interface ProductTableProps {
  products: Product[];
  isLoading?: boolean;
}

function ProductRow({ product }: { product: Product }) {
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
    <TableRow>
      <TableCell className="w-12">
        {primaryImage ? (
          <img
            src={primaryImage.storagePath}
            alt={primaryImage.fileName}
            className="h-10 w-10 rounded object-cover bg-muted"
          />
        ) : (
          <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
            <Package className="h-4 w-4 text-muted-foreground" />
          </div>
        )}
      </TableCell>
      <TableCell>
        <p className="font-medium">{product.name}</p>
        {product.description && (
          <p className="text-sm text-muted-foreground truncate max-w-xs">{product.description}</p>
        )}
      </TableCell>
      <TableCell>
        <Badge variant="secondary">{product.category}</Badge>
      </TableCell>
      <TableCell>
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[product.status] ?? ""}`}
        >
          {product.status}
        </span>
      </TableCell>
      <TableCell>
        {product._count.variants} variant{product._count.variants !== 1 ? "s" : ""}
        {" · "}
        {product._count.listings} listing{product._count.listings !== 1 ? "s" : ""}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(`/products/${product.id}`)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <ConfirmDialog
            trigger={
              <Button variant="ghost" size="icon" disabled={isDeleting}>
                <Trash2 className="h-4 w-4" />
              </Button>
            }
            title="Delete product?"
            description={`This will permanently delete "${product.name}" and all its variants.`}
            onConfirm={handleDelete}
            isPending={isDeleting}
          />
        </div>
      </TableCell>
    </TableRow>
  );
}

export function ProductTable({ products, isLoading }: ProductTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12"></TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Variants</TableHead>
            <TableHead className="w-20">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: 6 }).map((_, j) => (
                  <TableCell key={j}>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            products.map((p) => <ProductRow key={p.id} product={p} />)
          )}
        </TableBody>
      </Table>
    </div>
  );
}
