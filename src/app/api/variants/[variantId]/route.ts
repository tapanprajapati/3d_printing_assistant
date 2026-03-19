import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface Params {
  params: { variantId: string };
}

export async function GET(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const variant = await prisma.productVariant.findUnique({
    where: { id: params.variantId },
    include: { product: { select: { id: true, name: true } } },
  });

  if (!variant) return Response.json({ error: "Not found" }, { status: 404 });

  return Response.json({ data: variant });
}
