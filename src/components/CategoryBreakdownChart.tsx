"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

type CategoryTotal = { category: string; total: number };

const COLORS = ["#6FCF97", "#E8A33D", "#E85D4E", "#7FA8C9", "#B98FD1", "#5C6B7A"];

export function CategoryBreakdownChart({ data }: { data: CategoryTotal[] }) {
  if (data.length === 0) return null;

  return (
    <div className="bg-paper text-ink rounded-sm px-5 py-4">
      <p className="font-display font-medium mb-2">Where it's going</p>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="total"
              nameKey="category"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={2}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none" />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number, name: string) => [`₹${value.toFixed(2)}`, name]}
              contentStyle={{
                background: "#0F1B2B",
                border: "none",
                borderRadius: 4,
                color: "#F7F5F0",
                fontFamily: "IBM Plex Mono, monospace",
                fontSize: 12,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
        {data.map((d, i) => (
          <div key={d.category} className="flex items-center gap-1.5 text-xs font-mono text-slate">
            <span
              className="w-2.5 h-2.5 rounded-full inline-block"
              style={{ backgroundColor: COLORS[i % COLORS.length] }}
            />
            {d.category} · ₹{d.total.toFixed(0)}
          </div>
        ))}
      </div>
    </div>
  );
}
