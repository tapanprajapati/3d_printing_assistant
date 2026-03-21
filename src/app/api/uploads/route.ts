import { auth } from "@/lib/auth";
import { writeFile } from "fs/promises";
import { join } from "path";
import { getUploadDir } from "@/lib/upload-dir";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ALLOWED_MODEL_EXTENSIONS = [".stl", ".3mf", ".obj"];
const IMAGE_MAX_BYTES = 10 * 1024 * 1024;   // 10 MB
const MODEL_MAX_BYTES = 50 * 1024 * 1024;   // 50 MB

function getExtension(fileName: string) {
  const i = fileName.lastIndexOf(".");
  return i >= 0 ? fileName.slice(i).toLowerCase() : "";
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const uploadType = formData.get("uploadType") as string | null;

  if (!file || !uploadType) {
    return Response.json({ error: "file and uploadType are required" }, { status: 400 });
  }

  const ext = getExtension(file.name);

  if (uploadType === "image") {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return Response.json({ error: "Invalid image type. Allowed: JPEG, PNG, WebP, GIF" }, { status: 400 });
    }
    if (file.size > IMAGE_MAX_BYTES) {
      return Response.json({ error: "Image exceeds 10 MB limit" }, { status: 400 });
    }
  } else if (uploadType === "model") {
    if (!ALLOWED_MODEL_EXTENSIONS.includes(ext)) {
      return Response.json({ error: "Invalid model type. Allowed: .stl, .3mf, .obj" }, { status: 400 });
    }
    if (file.size > MODEL_MAX_BYTES) {
      return Response.json({ error: "Model file exceeds 50 MB limit" }, { status: 400 });
    }
  } else {
    return Response.json({ error: "uploadType must be 'image' or 'model'" }, { status: 400 });
  }

  const uuid = crypto.randomUUID();
  const newFileName = `${uuid}${ext}`;
  const subDir = uploadType === "image" ? "images" : "models";
  const storagePath = `/uploads/${subDir}/${newFileName}`;
  const diskPath = join(getUploadDir(), subDir, newFileName);

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(diskPath, buffer);

  return Response.json({
    data: {
      storagePath,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type || "application/octet-stream",
    },
  });
}
