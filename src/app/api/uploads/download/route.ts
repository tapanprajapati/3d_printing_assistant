import { NextRequest, NextResponse } from "next/server";
import { createReadStream, existsSync } from "fs";
import { Readable } from "stream";
import { storagePathToDisk } from "@/lib/upload-dir";

const ALLOWED_PATH_RE = /^\/uploads\/(images|models)\//;

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const storagePath = searchParams.get("path") ?? "";
  const fileName = searchParams.get("fileName") ?? "download";
  const mimeType = searchParams.get("mimeType") ?? "application/octet-stream";

  if (!ALLOWED_PATH_RE.test(storagePath)) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  const diskPath = storagePathToDisk(storagePath);

  if (!existsSync(diskPath)) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  const nodeStream = createReadStream(diskPath);
  const webStream = Readable.toWeb(nodeStream) as ReadableStream;

  return new NextResponse(webStream, {
    headers: {
      "Content-Type": mimeType,
      "Content-Disposition": `attachment; filename="${fileName.replace(/"/g, '\\"')}"`,
    },
  });
}
