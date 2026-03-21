"use client";

import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Star, ArrowUp, ArrowDown, Trash2, Upload, Loader2, Download, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useProductAssets, useCreateAsset, useUpdateAsset, useDeleteAsset } from "@/lib/hooks/use-products";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { uploadDownloadUrl } from "@/lib/upload-dir";

interface ProductAsset {
  id: string;
  fileName: string;
  storagePath: string;
  fileSize: number;
  mimeType: string;
  assetType: string;
  isPrimary: boolean;
  displayOrder: number;
}

const ACCEPTED_IMAGE_TYPES = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
  "image/gif": [".gif"],
};

export function ImageGallery({ productId }: { productId: string }) {
  const { data, isLoading } = useProductAssets(productId);
  const { mutateAsync: createAsset } = useCreateAsset(productId);
  const { mutate: updateAsset } = useUpdateAsset(productId);
  const { mutate: deleteAsset, isPending: isDeleting } = useDeleteAsset(productId);
  const [uploading, setUploading] = useState(false);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  const images: ProductAsset[] = (data?.data ?? []).filter((a: ProductAsset) => a.assetType === "IMAGE");

  const onDrop = useCallback(
    async (accepted: File[]) => {
      if (!accepted.length) return;
      setUploading(true);
      try {
        for (const file of accepted) {
          const fd = new FormData();
          fd.append("file", file);
          fd.append("uploadType", "image");

          const uploadRes = await fetch("/api/uploads", { method: "POST", body: fd });
          if (!uploadRes.ok) {
            const err = await uploadRes.json().catch(() => ({ error: "Upload failed" }));
            throw new Error(err.error ?? "Upload failed");
          }
          const { data: meta } = await uploadRes.json();

          await createAsset({
            fileName: meta.fileName,
            storagePath: meta.storagePath,
            fileSize: meta.fileSize,
            mimeType: meta.mimeType,
            assetType: "IMAGE",
            isPrimary: images.length === 0,
            displayOrder: images.length,
          });
        }
        toast.success("Image(s) uploaded");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [createAsset, images.length]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_IMAGE_TYPES,
    maxSize: 10 * 1024 * 1024,
    onDropRejected: (fileRejections) => {
      const reason = fileRejections[0]?.errors[0]?.message ?? "File rejected";
      toast.error(reason);
    },
  });

  function handleSetPrimary(assetId: string) {
    updateAsset(
      { assetId, data: { isPrimary: true } },
      { onError: () => toast.error("Failed to set primary image") }
    );
  }

  function handleReorder(assetId: string, direction: "up" | "down") {
    const idx = images.findIndex((a) => a.id === assetId);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= images.length) return;

    const current = images[idx];
    const swap = images[swapIdx];

    updateAsset({ assetId: current.id, data: { displayOrder: swap.displayOrder } });
    updateAsset({ assetId: swap.id, data: { displayOrder: current.displayOrder } });
  }

  function handleDelete(assetId: string) {
    deleteAsset(assetId, {
      onSuccess: () => toast.success("Image deleted"),
      onError: () => toast.error("Failed to delete image"),
    });
  }

  useEffect(() => {
    if (previewIndex === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") setPreviewIndex((i) => (i !== null && i > 0 ? i - 1 : i));
      if (e.key === "ArrowRight") setPreviewIndex((i) => (i !== null && i < images.length - 1 ? i + 1 : i));
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [previewIndex, images.length]);

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading images…</p>;

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
          isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"
        )}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
            <p className="text-sm">Uploading…</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Upload className="h-6 w-6" />
            <p className="text-sm">
              {isDragActive ? "Drop images here" : "Drag & drop images, or click to browse"}
            </p>
            <p className="text-xs">JPEG, PNG, WebP, GIF — max 10 MB</p>
          </div>
        )}
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {images.map((image, idx) => (
            <div key={image.id} className="relative group border rounded-lg overflow-hidden bg-muted/30">
              <img
                src={uploadDownloadUrl(image.storagePath, image.fileName, image.mimeType, true)}
                alt={image.fileName}
                className="w-full aspect-square object-cover cursor-zoom-in"
                onClick={() => setPreviewIndex(idx)}
              />
              {image.isPrimary && (
                <span className="absolute top-1 left-1 flex items-center gap-1 bg-yellow-400 text-yellow-900 text-xs font-medium px-1.5 py-0.5 rounded">
                  <Star className="h-3 w-3 fill-current" /> Primary
                </span>
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                <div className="flex justify-between gap-1">
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-7 w-7"
                    title="Preview"
                    onClick={(e) => { e.stopPropagation(); setPreviewIndex(idx); }}
                  >
                    <ZoomIn className="h-3.5 w-3.5" />
                  </Button>
                  <div className="flex gap-1">
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-7 w-7"
                      onClick={(e) => { e.stopPropagation(); handleReorder(image.id, "up"); }}
                      disabled={idx === 0}
                      title="Move up"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-7 w-7"
                      onClick={(e) => { e.stopPropagation(); handleReorder(image.id, "down"); }}
                      disabled={idx === images.length - 1}
                      title="Move down"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <div className="flex gap-1">
                  {!image.isPrimary && (
                    <Button
                      variant="secondary"
                      size="sm"
                      className="h-7 text-xs flex-1"
                      onClick={(e) => { e.stopPropagation(); handleSetPrimary(image.id); }}
                    >
                      Set Primary
                    </Button>
                  )}
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-7 w-7"
                    title="Download"
                    onClick={(e) => {
                      e.stopPropagation();
                      const url = `/api/uploads/download?path=${encodeURIComponent(image.storagePath)}&fileName=${encodeURIComponent(image.fileName)}&mimeType=${encodeURIComponent(image.mimeType)}`;
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = image.fileName;
                      a.click();
                    }}
                  >
                    <Download className="h-3.5 w-3.5" />
                  </Button>
                  <ConfirmDialog
                    trigger={
                      <Button variant="destructive" size="icon" className="h-7 w-7" disabled={isDeleting} onClick={(e) => e.stopPropagation()}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    }
                    title="Delete image?"
                    description={`This will permanently delete "${image.fileName}".`}
                    onConfirm={() => handleDelete(image.id)}
                    isPending={isDeleting}
                  />
                </div>
              </div>
              <p className="px-2 py-1 text-xs truncate text-muted-foreground border-t">{image.fileName}</p>
            </div>
          ))}
        </div>
      )}

      {images.length === 0 && !uploading && (
        <p className="text-sm text-muted-foreground text-center py-2">No images yet.</p>
      )}

      <Dialog open={previewIndex !== null} onOpenChange={(open) => !open && setPreviewIndex(null)}>
        <DialogContent className="max-w-4xl p-0 bg-black/90 border-none">
          <DialogTitle className="sr-only">Image preview</DialogTitle>
          {previewIndex !== null && (() => {
            const img = images[previewIndex];
            return (
              <div className="relative flex flex-col items-center">
                {previewIndex > 0 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2 text-white hover:bg-white/10 z-10"
                    onClick={() => setPreviewIndex(previewIndex - 1)}
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                )}
                {previewIndex < images.length - 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-white hover:bg-white/10 z-10"
                    onClick={() => setPreviewIndex(previewIndex + 1)}
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                )}
                <img
                  src={uploadDownloadUrl(img.storagePath, img.fileName, img.mimeType, true)}
                  alt={img.fileName}
                  className="max-h-[80vh] max-w-full object-contain"
                />
                <div className="w-full flex justify-between items-center px-4 py-2 text-white text-xs bg-black/60">
                  <span className="truncate">{img.fileName}</span>
                  <span>{previewIndex + 1} / {images.length}</span>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
