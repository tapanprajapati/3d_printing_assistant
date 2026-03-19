import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PrintJobSchema } from "@/lib/validations/print-job";

export async function GET(req: Request) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const showArchived = searchParams.get("showArchived") === "true";

  const where: Record<string, unknown> = {};
  if (status) {
    where.status = status;
  } else if (!showArchived) {
    where.status = { notIn: ["FAILED", "CANCELLED"] };
  }

  const jobs = await prisma.printJob.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      product: { select: { id: true, name: true } },
      variant: { select: { id: true, name: true } },
      filament: { select: { id: true, brand: true, colorName: true, colorHex: true, type: true } },
    },
  });

  return Response.json({ data: jobs, total: jobs.length });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = PrintJobSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { scheduledAt, ...rest } = parsed.data;

  const job = await prisma.printJob.create({
    data: {
      ...rest,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
    },
  });

  return Response.json({ data: job }, { status: 201 });
}
