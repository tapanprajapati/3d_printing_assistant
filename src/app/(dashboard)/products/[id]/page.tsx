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
import { ProductForm } from "@/components/products/product-form";
import { VariantTable } from "@/components/products/variant-table";
import { AssetTab } from "@/components/products/asset-tab";
import { ListingsTab } from "@/components/products/listings-tab";
import { useProduct, useUpdateProduct } from "@/lib/hooks/use-products";
import { toast } from "sonner";
import type { ProductInput } from "@/lib/validations/product";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data, isLoading } = useProduct(id);
  const { mutate: updateProduct, isPending } = useUpdateProduct();

  const product = data?.data;

  function handleSubmit(values: ProductInput) {
    updateProduct(
      { id, data: values },
      {
        onSuccess: () => toast.success("Product updated!"),
        onError: () => toast.error("Failed to update product"),
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

  if (!product) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Product not found.</p>
        <Button variant="link" onClick={() => router.push("/products")}>
          Back to Products
        </Button>
      </div>
    );
  }

  return (
    <div>
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/products">Products</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{product.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">{product.name}</h1>
        <p className="text-sm text-muted-foreground mt-1">{product.category}</p>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="variants">Variants</TabsTrigger>
          <TabsTrigger value="assets">Assets</TabsTrigger>
          <TabsTrigger value="listings">Listings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle>Product Details</CardTitle>
            </CardHeader>
            <CardContent>
              <ProductForm
                defaultValues={{
                  name: product.name,
                  description: product.description ?? "",
                  category: product.category,
                  status: product.status,
                }}
                onSubmit={handleSubmit}
                isPending={isPending}
                submitLabel="Save Changes"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="variants">
          <VariantTable productId={id} />
        </TabsContent>

        <TabsContent value="assets">
          <AssetTab productId={id} />
        </TabsContent>

        <TabsContent value="listings">
          <ListingsTab productId={id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
