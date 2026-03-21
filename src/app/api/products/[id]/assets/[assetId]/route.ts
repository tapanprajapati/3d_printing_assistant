import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProductAssetUpdateSchema } from "@/lib/validations/product";
import { unlink } from "fs/promises";
import { storagePathToDisk } from "@/lib/upload-dir";

interface Params {
  params: { id: string; assetId: string };
}

export async function PATCH(req: Request, { params }: Params) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const product = await prisma.product.findUnique({ where: { id: params.id } });
  if (!product) return Response.json({ error: "Product not found" }, { status: 404 });

  const asset = await prisma.productAsset.findUnique({ where: { id: params.assetId } });
  if (!asset) return Response.json({ error: "Asset not found" }, { status: 404 });

  const body = await req.json();
  const parsed = ProductAssetUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  // If setting this image as primary, unset all other images first
  if (parsed.data.isPrimary && asset.assetType === "IMAGE") {
    const updated = await prisma.$transaction([
      prisma.productAsset.updateMany({
        where: { productId: params.id, assetType: "IMAGE", id: { not: params.assetId } },
        data: { isPrimary: false },
      }),
      prisma.productAsset.update({
        where: { id: params.assetId },
        data: parsed.data,
      }),
    ]);
    return Response.json({ data: updated[1] });
  }

  const updated = await prisma.productAsset.update({
    where: { id: params.assetId },
    data: parsed.data,
  });

  return Response.json({ data: updated });
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const product = await prisma.product.findUnique({ where: { id: params.id } });
  if (!product) return Response.json({ error: "Product not found" }, { status: 404 });

  const asset = await prisma.productAsset.findUnique({ where: { id: params.assetId } });
  if (!asset) return Response.json({ error: "Asset not found" }, { status: 404 });

  // Delete file from disk
  try {
    const diskPath = storagePathToDisk(asset.storagePath);
    await unlink(diskPath);
  } catch {
    // File may already be gone; continue
  }

  await prisma.productAsset.delete({ where: { id: params.assetId } });

  return new Response(null, { status: 204 });
}
