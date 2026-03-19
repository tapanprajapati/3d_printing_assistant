import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ListingCreateSchema } from "@/lib/validations/listing";

interface Params {
  params: { id: string };
}

export async function GET(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const listings = await prisma.marketplaceListing.findMany({
    where: { productId: params.id },
    orderBy: { createdAt: "desc" },
  });

  return Response.json({ data: listings });
}

export async function POST(req: Request, { params }: Params) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = ListingCreateSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { dateListed, listingUrl, ...rest } = parsed.data;

  const listing = await prisma.marketplaceListing.create({
    data: {
      ...rest,
      listingUrl: listingUrl || null,
      dateListed: dateListed ? new Date(dateListed) : null,
      productId: params.id,
    },
  });

  return Response.json({ data: listing }, { status: 201 });
}
