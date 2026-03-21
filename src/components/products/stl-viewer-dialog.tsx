"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

const StlViewerCanvas = dynamic(() => import("./stl-viewer-canvas"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  ),
});

interface StlViewerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fileName: string;
  storagePath: string;
  mimeType: string;
}

export function StlViewerDialog({
  open,
  onOpenChange,
  fileName,
  storagePath,
  mimeType,
}: StlViewerDialogProps) {
  const fileUrl = `/api/uploads/download?path=${encodeURIComponent(storagePath)}&fileName=${encodeURIComponent(fileName)}&mimeType=${encodeURIComponent(mimeType)}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 bg-[#1a1a2e] border-none overflow-hidden">
        <DialogTitle className="sr-only">3D Preview — {fileName}</DialogTitle>

        {/* Canvas area */}
        <div className="w-full" style={{ height: "60vh" }}>
          {open && <StlViewerCanvas url={fileUrl} />}
        </div>

        {/* Bottom bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-black/30">
          <span className="font-mono text-xs text-white/70 truncate max-w-[60%]">
            {fileName}
          </span>
          <span className="text-xs text-white/40 shrink-0">
            Drag to rotate · Scroll to zoom
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
