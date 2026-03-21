import { join } from "path";

export function getUploadDir(): string {
  return process.env.UPLOAD_DIR ?? join(process.cwd(), "public", "uploads");
}

/** Convert DB storagePath (/uploads/images/uuid.png) to absolute disk path */
export function storagePathToDisk(storagePath: string): string {
  // Strip leading /uploads/ prefix, then join with upload root
  const relative = storagePath.replace(/^\/uploads\//, "");
  return join(getUploadDir(), relative);
}

export function uploadDownloadUrl(
  storagePath: string,
  fileName: string,
  mimeType: string,
  inline = false
): string {
  const base = `/api/uploads/download?path=${encodeURIComponent(storagePath)}&fileName=${encodeURIComponent(fileName)}&mimeType=${encodeURIComponent(mimeType)}`;
  return inline ? `${base}&inline=true` : base;
}
