"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { ProductForm } from "@/components/products/product-form";
import { useCreateProduct } from "@/lib/hooks/use-products";
import { toast } from "sonner";
import type { ProductInput } from "@/lib/validations/product";

export default function NewProductPage() {
  const router = useRouter();
  const { mutate: createProduct, isPending } = useCreateProduct();

  function handleSubmit(values: ProductInput) {
    createProduct(values, {
      onSuccess: (res) => {
        toast.success("Product created!");
        router.push(`/products/${res.data.id}`);
      },
      onError: () => toast.error("Failed to create product"),
    });
  }

  return (
    <div>
      <PageHeader title="New Product" description="Add a product to your catalog" />

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductForm onSubmit={handleSubmit} isPending={isPending} submitLabel="Create Product" />
        </CardContent>
      </Card>
    </div>
  );
}
