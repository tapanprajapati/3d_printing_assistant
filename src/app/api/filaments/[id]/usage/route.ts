import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UsageLogSchema } from "@/lib/validations/filament";

interface Params {
  params: { id: string };
}

export async function GET(req: Request, { params }: Params) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = Math.min(100, parseInt(searchParams.get("limit") ?? "20", 10));
  const skip = (page - 1) * limit;

  const [logs, total] = await Promise.all([
    prisma.filamentUsageLog.findMany({
      where: { filamentId: params.id },
      orderBy: { loggedAt: "desc" },
      skip,
      take: limit,
      include: { printJob: { select: { id: true, title: true } } },
    }),
    prisma.filamentUsageLog.count({ where: { filamentId: params.id } }),
  ]);

  return Response.json({ data: logs, total });
}

export async function POST(req: Request, { params }: Params) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = UsageLogSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const filament = await prisma.filament.findUnique({ where: { id: params.id } });
  if (!filament) return Response.json({ error: "Filament not found" }, { status: 404 });

  const [log] = await prisma.$transaction([
    prisma.filamentUsageLog.create({
      data: {
        filamentId: params.id,
        gramsUsed: parsed.data.gramsUsed,
        note: parsed.data.note,
      },
    }),
    prisma.filament.update({
      where: { id: params.id },
      data: {
        remainingWeightG: Math.max(
          0,
          filament.remainingWeightG - Math.round(parsed.data.gramsUsed)
        ),
      },
    }),
  ]);

  return Response.json({ data: log }, { status: 201 });
}
