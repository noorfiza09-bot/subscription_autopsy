"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

type TrendPoint = { month: string; total: number };

function formatMonth(month: string) {
  const [year, m] = month.split("-");
  const date = new Date(Number(year), Number(m) - 1, 1);
  return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

export function SpendTrendChart({ data }: { data: TrendPoint[] }) {
  if (data.length < 2) return null; // need at least 2 points for a trend to mean anything

  const formatted = data.map((d) => ({ ...d, label: formatMonth(d.month) }));

  return (
    <div className="bg-soft text-main rounded-2xl border border-black/[0.06] px-5 py-5">
      <p className="font-semibold tracking-tight mb-2">Recurring spend over time</p>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={formatted} margin={{ top: 5, right: 10, bottom: 0, left: -10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.08)" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fontFamily: "Inter, sans-serif", fill: "#5D6B7B" }}
              axisLine={{ stroke: "rgba(0,0,0,0.12)" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fontFamily: "Inter, sans-serif", fill: "#5D6B7B" }}
              axisLine={false}
              tickLine={false}
              width={50}
            />
            <Tooltip
              formatter={(value: number) => [`₹${value.toFixed(2)}`, "Total"]}
              contentStyle={{
                background: "#0F0F0F",
                border: "none",
                borderRadius: 8,
                color: "#FFFFFF",
                fontFamily: "Inter, sans-serif",
                fontSize: 12,
              }}
            />
            <Line
              type="monotone"
              dataKey="total"
              stroke="#0075DE"
              strokeWidth={2}
              dot={{ fill: "#0075DE", r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
