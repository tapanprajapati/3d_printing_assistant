import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { settingsSchema } from "@/lib/validations/settings";

export async function GET() {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const settings = await prisma.appSettings.findFirst();
  return Response.json({ data: settings });
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const result = settingsSchema.safeParse(body);
  if (!result.success) {
    return Response.json({ error: result.error.flatten() }, { status: 400 });
  }

  const updated = await prisma.appSettings.update({
    where: { id: "default" },
    data: result.data,
  });

  return Response.json({ data: updated });
}
