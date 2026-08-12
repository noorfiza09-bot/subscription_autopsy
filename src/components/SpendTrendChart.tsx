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
    <div className="bg-paper text-ink rounded-sm px-5 py-4">
      <p className="font-display font-medium mb-2">Recurring spend over time</p>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={formatted} margin={{ top: 5, right: 10, bottom: 0, left: -10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,27,43,0.1)" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fontFamily: "IBM Plex Mono, monospace", fill: "#5C6B7A" }}
              axisLine={{ stroke: "rgba(15,27,43,0.15)" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fontFamily: "IBM Plex Mono, monospace", fill: "#5C6B7A" }}
              axisLine={false}
              tickLine={false}
              width={50}
            />
            <Tooltip
              formatter={(value: number) => [`₹${value.toFixed(2)}`, "Total"]}
              contentStyle={{
                background: "#0F1B2B",
                border: "none",
                borderRadius: 4,
                color: "#F7F5F0",
                fontFamily: "IBM Plex Mono, monospace",
                fontSize: 12,
              }}
            />
            <Line
              type="monotone"
              dataKey="total"
              stroke="#6FCF97"
              strokeWidth={2}
              dot={{ fill: "#6FCF97", r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
