import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FilamentUpdateSchema } from "@/lib/validations/filament";

interface Params {
  params: { id: string };
}

export async function GET(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const filament = await prisma.filament.findUnique({ where: { id: params.id } });
  if (!filament) return Response.json({ error: "Not found" }, { status: 404 });

  return Response.json({ data: filament });
}

export async function PATCH(req: Request, { params }: Params) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = FilamentUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const filament = await prisma.filament.update({
      where: { id: params.id },
      data: parsed.data,
    });
    return Response.json({ data: filament });
  } catch {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await prisma.filament.delete({ where: { id: params.id } });
    return new Response(null, { status: 204 });
  } catch {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
}
