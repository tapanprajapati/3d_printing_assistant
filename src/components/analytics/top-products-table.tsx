"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface ProductData {
  productName: string;
  totalRevenue: number;
  profit: number;
  avgMarginPct: number;
}

interface Props {
  data: ProductData[];
}

function marginClass(margin: number) {
  if (margin >= 30) return "text-green-600 dark:text-green-400 font-semibold";
  if (margin >= 10) return "text-yellow-600 dark:text-yellow-400 font-semibold";
  return "text-red-600 dark:text-red-400 font-semibold";
}

export function TopProductsTable({ data }: Props) {
  if (data.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4">
        No product data available.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Product</TableHead>
          <TableHead className="text-right">Revenue</TableHead>
          <TableHead className="text-right">Profit</TableHead>
          <TableHead className="text-right">Margin</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row) => (
          <TableRow key={row.productName}>
            <TableCell className="font-medium">{row.productName}</TableCell>
            <TableCell className="text-right">${row.totalRevenue.toFixed(2)}</TableCell>
            <TableCell className="text-right">${row.profit.toFixed(2)}</TableCell>
            <TableCell className={cn("text-right", marginClass(row.avgMarginPct))}>
              {row.avgMarginPct.toFixed(1)}%
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
