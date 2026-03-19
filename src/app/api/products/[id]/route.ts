import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProductUpdateSchema } from "@/lib/validations/product";

interface Params {
  params: { id: string };
}

export async function GET(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: { variants: { orderBy: { createdAt: "asc" } } },
  });
  if (!product) return Response.json({ error: "Not found" }, { status: 404 });

  return Response.json({ data: product });
}

export async function PATCH(req: Request, { params }: Params) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = ProductUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const product = await prisma.product.update({
      where: { id: params.id },
      data: parsed.data,
    });
    return Response.json({ data: product });
  } catch {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await prisma.product.delete({ where: { id: params.id } });
    return new Response(null, { status: 204 });
  } catch {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
}
