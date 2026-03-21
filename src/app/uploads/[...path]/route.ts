import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join, resolve } from "path";
import { getUploadDir } from "@/lib/upload-dir";

const MIME: Record<string, string> = {
  png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg",
  webp: "image/webp", gif: "image/gif",
  stl: "model/stl", "3mf": "model/3mf", obj: "model/obj",
};

export async function GET(
  _req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const uploadDir = getUploadDir();
  const diskPath = join(uploadDir, ...params.path);

  // Prevent directory traversal
  if (!resolve(diskPath).startsWith(resolve(uploadDir))) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  try {
    const buffer = await readFile(diskPath);
    const ext = (params.path.at(-1) ?? "").split(".").pop()?.toLowerCase() ?? "";
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": MIME[ext] ?? "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Not Found", { status: 404 });
  }
}
