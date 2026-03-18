"use client";

import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface UsageLog {
  id: string;
  gramsUsed: number;
  note: string | null;
  loggedAt: string;
  printJob?: { id: string; title: string } | null;
}

interface UsageLogTableProps {
  logs: UsageLog[];
  total: number;
  page: number;
  onPageChange: (page: number) => void;
  limit?: number;
}

export function UsageLogTable({
  logs,
  total,
  page,
  onPageChange,
  limit = 20,
}: UsageLogTableProps) {
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-2">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Grams Used</TableHead>
            <TableHead>Note</TableHead>
            <TableHead>Print Job</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                No usage logs yet.
              </TableCell>
            </TableRow>
          ) : (
            logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="text-sm">
                  {format(new Date(log.loggedAt), "MMM d, yyyy h:mm a")}
                </TableCell>
                <TableCell className="text-right font-medium">{log.gramsUsed}g</TableCell>
                <TableCell className="text-sm text-muted-foreground">{log.note ?? "—"}</TableCell>
                <TableCell className="text-sm">
                  {log.printJob ? (
                    <span className="text-foreground">{log.printJob.title}</span>
                  ) : (
                    <span className="text-muted-foreground">Manual entry</span>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-1">
          <p className="text-sm text-muted-foreground">
            {total} total entries
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm px-2">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
