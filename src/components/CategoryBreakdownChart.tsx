"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

type CategoryTotal = { category: string; total: number };

const COLORS = ["#0075DE", "#1A9E5C", "#D98A1A", "#7C5CE0", "#E0453A", "#5D6B7B"];

export function CategoryBreakdownChart({ data }: { data: CategoryTotal[] }) {
  if (data.length === 0) return null;

  return (
    <div className="bg-soft text-main rounded-2xl border border-black/[0.06] px-5 py-5">
      <p className="font-semibold tracking-tight mb-2">Where it's going</p>
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
                background: "#0F0F0F",
                border: "none",
                borderRadius: 8,
                color: "#FFFFFF",
                fontFamily: "Inter, sans-serif",
                fontSize: 12,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
        {data.map((d, i) => (
          <div key={d.category} className="flex items-center gap-1.5 text-xs text-muted">
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
