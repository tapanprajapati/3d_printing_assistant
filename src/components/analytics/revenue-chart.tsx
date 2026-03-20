"use client";

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface MonthlyData {
  month: string;
  revenue: number;
  profit: number;
  jobs: number;
}

interface Props {
  data: MonthlyData[];
}

function formatCurrency(value: number) {
  return `$${value.toFixed(2)}`;
}

export function RevenueChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 12 }}
          className="text-muted-foreground"
        />
        <YAxis
          tick={{ fontSize: 12 }}
          tickFormatter={(v) => `$${v}`}
          className="text-muted-foreground"
        />
        <Tooltip
          formatter={(value, name) => [
            formatCurrency(Number(value)),
            name === "revenue" ? "Revenue" : "Profit",
          ]}
        />
        <Legend
          formatter={(value) => (value === "revenue" ? "Revenue" : "Profit")}
        />
        <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} name="revenue" />
        <Line
          type="monotone"
          dataKey="profit"
          stroke="#22c55e"
          strokeWidth={2}
          dot={(props) => {
            const { cx, cy, value } = props;
            const color = value >= 0 ? "#22c55e" : "#ef4444";
            return <circle key={`dot-${cx}-${cy}`} cx={cx} cy={cy} r={4} fill={color} stroke="white" strokeWidth={1} />;
          }}
          name="profit"
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
