import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PrintJobUpdateSchema } from "@/lib/validations/print-job";

interface Params {
  params: { id: string };
}

const VALID_TRANSITIONS: Record<string, string[]> = {
  QUEUED: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["COMPLETED", "FAILED", "CANCELLED"],
  COMPLETED: [],
  FAILED: [],
  CANCELLED: [],
};

export async function GET(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const job = await prisma.printJob.findUnique({
    where: { id: params.id },
    include: {
      product: { select: { id: true, name: true } },
      variant: { select: { id: true, name: true } },
      filament: { select: { id: true, brand: true, colorName: true, colorHex: true, type: true } },
      usageLogs: { orderBy: { loggedAt: "desc" } },
    },
  });

  if (!job) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json({ data: job });
}

export async function PATCH(req: Request, { params }: Params) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = PrintJobUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { status, actualHours, gramsUsed, scheduledAt, ...rest } = parsed.data;

  // No status change — pure field update
  if (!status) {
    try {
      const job = await prisma.printJob.update({
        where: { id: params.id },
        data: {
          ...rest,
          scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
        },
      });
      return Response.json({ data: job });
    } catch {
      return Response.json({ error: "Not found" }, { status: 404 });
    }
  }

  // Status transition
  const current = await prisma.printJob.findUnique({ where: { id: params.id } });
  if (!current) return Response.json({ error: "Not found" }, { status: 404 });

  const allowed = VALID_TRANSITIONS[current.status] ?? [];
  if (!allowed.includes(status)) {
    return Response.json(
      { error: `Cannot transition from ${current.status} to ${status}` },
      { status: 400 }
    );
  }

  const now = new Date();

  if (status === "IN_PROGRESS") {
    const job = await prisma.printJob.update({
      where: { id: params.id },
      data: { status, startedAt: now },
    });
    return Response.json({ data: job });
  }

  if (status === "COMPLETED") {
    const filamentId = current.filamentId;
    if (filamentId && gramsUsed && gramsUsed > 0) {
      const filament = await prisma.filament.findUnique({ where: { id: filamentId } });
      if (!filament) return Response.json({ error: "Filament not found" }, { status: 404 });

      const [, , job] = await prisma.$transaction([
        prisma.filamentUsageLog.create({
          data: {
            filamentId,
            printJobId: params.id,
            gramsUsed,
            note: `Auto-logged: ${current.title}`,
          },
        }),
        prisma.filament.update({
          where: { id: filamentId },
          data: {
            remainingWeightG: Math.max(
              0,
              filament.remainingWeightG - Math.round(gramsUsed)
            ),
          },
        }),
        prisma.printJob.update({
          where: { id: params.id },
          data: { status: "COMPLETED", completedAt: now, actualHours, gramsUsed },
        }),
      ]);
      return Response.json({ data: job });
    }

    const job = await prisma.printJob.update({
      where: { id: params.id },
      data: { status: "COMPLETED", completedAt: now, actualHours },
    });
    return Response.json({ data: job });
  }

  if (status === "FAILED") {
    const job = await prisma.printJob.update({
      where: { id: params.id },
      data: { status, completedAt: now },
    });
    return Response.json({ data: job });
  }

  // CANCELLED — no side effects
  const job = await prisma.printJob.update({
    where: { id: params.id },
    data: { status },
  });
  return Response.json({ data: job });
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await prisma.printJob.delete({ where: { id: params.id } });
    return new Response(null, { status: 204 });
  } catch {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
}
