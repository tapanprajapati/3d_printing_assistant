import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FilamentSchema } from "@/lib/validations/filament";

export async function GET(req: Request) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const lowStock = searchParams.get("lowStock") === "true";

  const where: Record<string, unknown> = {};
  if (type) where.type = type;

  const [filaments, appSettings] = await Promise.all([
    prisma.filament.findMany({ where, orderBy: { createdAt: "desc" } }),
    lowStock ? prisma.appSettings.findFirst({ where: { id: "default" } }) : null,
  ]);

  const filtered = lowStock
    ? filaments.filter((f) => {
        const threshold = f.lowStockThresholdG ?? appSettings?.lowStockThresholdG ?? 100;
        return f.remainingWeightG < threshold;
      })
    : filaments;

  return Response.json({ data: filtered, total: filtered.length });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = FilamentSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const filament = await prisma.filament.create({ data: parsed.data });
  return Response.json({ data: filament }, { status: 201 });
}
