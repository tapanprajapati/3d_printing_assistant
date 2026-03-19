"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Trash2, Upload, Loader2, File } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  version: string | null;
  versionNote: string | null;
}

const MODEL_ASSET_TYPES = ["MODEL_STL", "MODEL_3MF", "OTHER"];

const ACCEPTED_MODEL_TYPES = {
  "model/stl": [".stl"],
  "application/octet-stream": [".stl", ".3mf"],
  "text/plain": [".obj"],
};

function extToAssetType(fileName: string): string {
  const ext = fileName.slice(fileName.lastIndexOf(".")).toLowerCase();
  if (ext === ".stl") return "MODEL_STL";
  if (ext === ".3mf") return "MODEL_3MF";
  return "OTHER";
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function InlineEdit({
  value,
  placeholder,
  onSave,
}: {
  value: string | null;
  placeholder: string;
  onSave: (val: string | null) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? "");

  if (editing) {
    return (
      <Input
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => {
          setEditing(false);
          onSave(draft.trim() || null);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
          if (e.key === "Escape") {
            setDraft(value ?? "");
            setEditing(false);
          }
        }}
        className="h-7 text-sm"
      />
    );
  }

  return (
    <span
      className={cn(
        "cursor-pointer hover:underline text-sm",
        !value && "text-muted-foreground italic"
      )}
      onClick={() => setEditing(true)}
    >
      {value ?? placeholder}
    </span>
  );
}

export function ModelFileList({ productId }: { productId: string }) {
  const { data, isLoading } = useProductAssets(productId);
  const { mutateAsync: createAsset } = useCreateAsset(productId);
  const { mutate: updateAsset } = useUpdateAsset(productId);
  const { mutate: deleteAsset, isPending: isDeleting } = useDeleteAsset(productId);
  const [uploading, setUploading] = useState(false);

  const models: ProductAsset[] = (data?.data ?? []).filter((a: ProductAsset) =>
    MODEL_ASSET_TYPES.includes(a.assetType)
  );

  const onDrop = useCallback(
    async (accepted: File[]) => {
      if (!accepted.length) return;
      setUploading(true);
      try {
        for (const file of accepted) {
          const fd = new FormData();
          fd.append("file", file);
          fd.append("uploadType", "model");

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
            assetType: extToAssetType(file.name),
            displayOrder: models.length,
          });
        }
        toast.success("Model file(s) uploaded");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [createAsset, models.length]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_MODEL_TYPES,
    maxSize: 50 * 1024 * 1024,
    onDropRejected: (fileRejections) => {
      const reason = fileRejections[0]?.errors[0]?.message ?? "File rejected";
      toast.error(reason);
    },
  });

  function handleDelete(assetId: string) {
    deleteAsset(assetId, {
      onSuccess: () => toast.success("Model file deleted"),
      onError: () => toast.error("Failed to delete model file"),
    });
  }

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading model files…</p>;

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
              {isDragActive ? "Drop model files here" : "Drag & drop model files, or click to browse"}
            </p>
            <p className="text-xs">.STL, .3MF, .OBJ — max 50 MB</p>
          </div>
        )}
      </div>

      {models.length > 0 && (
        <div className="rounded-lg border divide-y">
          {models.map((model) => (
            <div key={model.id} className="flex items-center gap-3 px-3 py-2">
              <File className="h-4 w-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{model.fileName}</p>
                <p className="text-xs text-muted-foreground">{formatBytes(model.fileSize)}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className="w-24">
                  <InlineEdit
                    value={model.version}
                    placeholder="Version"
                    onSave={(val) =>
                      updateAsset(
                        { assetId: model.id, data: { version: val } },
                        { onError: () => toast.error("Failed to update version") }
                      )
                    }
                  />
                </div>
                <div className="w-36">
                  <InlineEdit
                    value={model.versionNote}
                    placeholder="Note"
                    onSave={(val) =>
                      updateAsset(
                        { assetId: model.id, data: { versionNote: val } },
                        { onError: () => toast.error("Failed to update note") }
                      )
                    }
                  />
                </div>
                <ConfirmDialog
                  trigger={
                    <Button variant="ghost" size="icon" className="h-7 w-7" disabled={isDeleting}>
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  }
                  title="Delete model file?"
                  description={`This will permanently delete "${model.fileName}".`}
                  onConfirm={() => handleDelete(model.id)}
                  isPending={isDeleting}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {models.length === 0 && !uploading && (
        <p className="text-sm text-muted-foreground text-center py-2">No model files yet.</p>
      )}
    </div>
  );
}
