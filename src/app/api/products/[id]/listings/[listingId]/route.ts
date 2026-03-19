import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ListingUpdateSchema } from "@/lib/validations/listing";

interface Params {
  params: { id: string; listingId: string };
}

export async function PATCH(req: Request, { params }: Params) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = ListingUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { dateListed, listingUrl, ...rest } = parsed.data;
  const updateData: Record<string, unknown> = { ...rest };
  if (listingUrl !== undefined) updateData.listingUrl = listingUrl || null;
  if (dateListed !== undefined)
    updateData.dateListed = dateListed ? new Date(dateListed) : null;

  try {
    const listing = await prisma.marketplaceListing.update({
      where: { id: params.listingId, productId: params.id },
      data: updateData,
    });
    return Response.json({ data: listing });
  } catch {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await prisma.marketplaceListing.delete({
      where: { id: params.listingId, productId: params.id },
    });
    return new Response(null, { status: 204 });
  } catch {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
}
