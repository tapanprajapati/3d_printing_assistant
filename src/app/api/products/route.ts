import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProductSchema } from "@/lib/validations/product";

export async function GET(req: Request) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const category = searchParams.get("category");
  const search = searchParams.get("search");

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (category) where.category = category;
  if (search) where.name = { contains: search };

  const products = await prisma.product.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { variants: true } },
      assets: { where: { isPrimary: true, assetType: "IMAGE" }, take: 1 },
    },
  });

  return Response.json({ data: products, total: products.length });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = ProductSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const product = await prisma.product.create({ data: parsed.data });
  return Response.json({ data: product }, { status: 201 });
}
