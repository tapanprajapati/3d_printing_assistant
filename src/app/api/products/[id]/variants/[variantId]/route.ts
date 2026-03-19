import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProductVariantUpdateSchema } from "@/lib/validations/product";

interface Params {
  params: { id: string; variantId: string };
}

export async function PATCH(req: Request, { params }: Params) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = ProductVariantUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const variant = await prisma.productVariant.update({
      where: { id: params.variantId, productId: params.id },
      data: parsed.data,
    });
    return Response.json({ data: variant });
  } catch {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await prisma.productVariant.delete({
      where: { id: params.variantId, productId: params.id },
    });
    return new Response(null, { status: 204 });
  } catch {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
}
