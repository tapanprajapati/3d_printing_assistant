import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface Params {
  params: { id: string };
}

export async function GET(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const product = await prisma.product.findUnique({ where: { id: params.id } });
  if (!product) return Response.json({ error: "Product not found" }, { status: 404 });

  const assets = await prisma.productAsset.findMany({
    where: { productId: params.id },
    orderBy: { displayOrder: "asc" },
  });

  return Response.json({ data: assets });
}

export async function POST(req: Request, { params }: Params) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const product = await prisma.product.findUnique({ where: { id: params.id } });
  if (!product) return Response.json({ error: "Product not found" }, { status: 404 });

  const body = await req.json();
  const { fileName, storagePath, fileSize, mimeType, assetType, isPrimary, displayOrder, version, versionNote } = body;

  if (!fileName || !storagePath || !fileSize || !assetType) {
    return Response.json({ error: "fileName, storagePath, fileSize, and assetType are required" }, { status: 400 });
  }

  const asset = await prisma.productAsset.create({
    data: {
      productId: params.id,
      fileName,
      storagePath,
      fileSize,
      mimeType: mimeType ?? "application/octet-stream",
      assetType,
      isPrimary: isPrimary ?? false,
      displayOrder: displayOrder ?? 0,
      version: version ?? null,
      versionNote: versionNote ?? null,
    },
  });

  return Response.json({ data: asset }, { status: 201 });
}
