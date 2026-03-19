import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProductVariantSchema } from "@/lib/validations/product";

interface Params {
  params: { id: string };
}

export async function GET(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const variants = await prisma.productVariant.findMany({
    where: { productId: params.id },
    orderBy: { createdAt: "asc" },
  });

  return Response.json({ data: variants });
}

export async function POST(req: Request, { params }: Params) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = ProductVariantSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const existing = await prisma.productVariant.findUnique({
    where: { sku: parsed.data.sku },
  });
  if (existing) {
    return Response.json({ error: "SKU already exists" }, { status: 409 });
  }

  const variant = await prisma.productVariant.create({
    data: { ...parsed.data, productId: params.id },
  });
  return Response.json({ data: variant }, { status: 201 });
}
