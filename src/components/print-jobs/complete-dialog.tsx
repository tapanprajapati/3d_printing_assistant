"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CompleteDialogProps {
  jobId: string;
  jobTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (actualHours: number, gramsUsed?: number) => void;
  isPending?: boolean;
}

export function CompleteDialog({
  jobTitle,
  open,
  onOpenChange,
  onConfirm,
  isPending,
}: CompleteDialogProps) {
  const [actualHours, setActualHours] = useState("");
  const [gramsUsed, setGramsUsed] = useState("");

  useEffect(() => {
    if (open) {
      setActualHours("");
      setGramsUsed("");
    }
  }, [open]);

  function handleConfirm() {
    const hours = parseFloat(actualHours);
    if (isNaN(hours) || hours < 0) return;
    const grams = gramsUsed !== "" ? parseFloat(gramsUsed) : undefined;
    onConfirm(hours, grams);
  }

  const canConfirm = actualHours !== "" && !isNaN(parseFloat(actualHours));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Complete Print Job</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Mark <span className="font-medium text-foreground">{jobTitle}</span> as completed.
        </p>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="actualHours">Actual Hours</Label>
            <Input
              id="actualHours"
              type="number"
              step="0.25"
              min="0"
              placeholder="e.g. 2.5"
              value={actualHours}
              onChange={(e) => setActualHours(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="gramsUsed">
              Grams Used{" "}
              <span className="text-muted-foreground font-normal">optional</span>
            </Label>
            <Input
              id="gramsUsed"
              type="number"
              step="1"
              min="0"
              placeholder="e.g. 45"
              value={gramsUsed}
              onChange={(e) => setGramsUsed(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Leave blank if filament not tracked
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!canConfirm || isPending}>
            {isPending ? "Saving…" : "Mark Completed"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
