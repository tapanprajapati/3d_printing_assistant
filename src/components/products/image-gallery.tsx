"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Star, ArrowUp, ArrowDown, Trash2, Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useProductAssets, useCreateAsset, useUpdateAsset, useDeleteAsset } from "@/lib/hooks/use-products";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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
                src={image.storagePath}
                alt={image.fileName}
                className="w-full aspect-square object-cover"
              />
              {image.isPrimary && (
                <span className="absolute top-1 left-1 flex items-center gap-1 bg-yellow-400 text-yellow-900 text-xs font-medium px-1.5 py-0.5 rounded">
                  <Star className="h-3 w-3 fill-current" /> Primary
                </span>
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                <div className="flex justify-end gap-1">
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => handleReorder(image.id, "up")}
                    disabled={idx === 0}
                    title="Move up"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => handleReorder(image.id, "down")}
                    disabled={idx === images.length - 1}
                    title="Move down"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <div className="flex gap-1">
                  {!image.isPrimary && (
                    <Button
                      variant="secondary"
                      size="sm"
                      className="h-7 text-xs flex-1"
                      onClick={() => handleSetPrimary(image.id)}
                    >
                      Set Primary
                    </Button>
                  )}
                  <ConfirmDialog
                    trigger={
                      <Button variant="destructive" size="icon" className="h-7 w-7" disabled={isDeleting}>
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
    </div>
  );
}
