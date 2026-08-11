"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import { SubscriptionCard } from "@/components/SubscriptionCard";
import { CategoryBreakdownChart } from "@/components/CategoryBreakdownChart";

type Subscription = {
  id: string;
  displayName: string;
  amount: number;
  previousAmount: number | null;
  frequency: string;
  lastChargeDate: string;
  nextExpectedDate: string | null;
  isConfirmed: boolean;
  isDismissed: boolean;
  category: string | null;
};

function monthlyEquivalent(sub: Subscription) {
  const multiplier =
    sub.frequency === "YEARLY" ? 1 / 12 : sub.frequency === "WEEKLY" ? 4.33 : 1;
  return sub.amount * multiplier;
}

export default function Dashboard() {
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/subscriptions")
      .then((r) => r.json())
      .then((data) => {
        setSubs(data);
        setLoading(false);
      });
  }, []);

  async function patchSub(id: string, body: Partial<Subscription>) {
    await fetch(`/api/subscriptions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setSubs((prev) =>
      body.isDismissed
        ? prev.filter((s) => s.id !== id)
        : prev.map((s) => (s.id === id ? { ...s, ...body } : s))
    );
  }

  const monthlyTotal = subs.reduce((sum, s) => sum + monthlyEquivalent(s), 0);

  const categoryTotals = Object.values(
    subs.reduce<Record<string, { category: string; total: number }>>((acc, s) => {
      const key = s.category ?? "Uncategorized";
      acc[key] = acc[key] ?? { category: key, total: 0 };
      acc[key].total += monthlyEquivalent(s);
      return acc;
    }, {})
  ).sort((a, b) => b.total - a.total);

  return (
    <main className="min-h-screen px-6 py-16 max-w-2xl mx-auto">
      <p className="font-mono text-xs tracking-widest text-sage uppercase mb-2">
        Itemized receipt · monthly summary
      </p>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold mb-1">Your recurring spend</h1>
          <p className="text-slate mb-8">
            {subs.length} subscription{subs.length !== 1 ? "s" : ""} detected · roughly{" "}
            <span className="font-mono text-paper">₹{monthlyTotal.toFixed(2)}</span> / month
          </p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="text-xs font-mono px-3 py-1.5 border border-paper/20 rounded-sm hover:bg-ink-light transition-colors whitespace-nowrap"
        >
          Sign out
        </button>
      </div>

      {loading && (
        <div className="flex flex-col gap-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-24 rounded-sm bg-ink-light animate-pulse" />
          ))}
        </div>
      )}

      {!loading && subs.length === 0 && (
        <div className="border border-dashed border-paper/20 rounded-sm px-6 py-12 text-center">
          <p className="font-display text-lg mb-1">Nothing here yet</p>
          <p className="text-slate text-sm">
            Upload a statement from the home page and we'll comb through it for
            recurring charges.
          </p>
        </div>
      )}

      {!loading && subs.length > 0 && (
        <>
          <div className="mb-6">
            <CategoryBreakdownChart data={categoryTotals} />
          </div>

          <div className="flex flex-col gap-4">
            {subs.map((sub) => (
              <SubscriptionCard
                key={sub.id}
                sub={sub}
                onConfirm={(id) => patchSub(id, { isConfirmed: true })}
                onDismiss={(id) => patchSub(id, { isDismissed: true })}
                onCategoryChange={(id, category) => patchSub(id, { category })}
              />
            ))}
          </div>
        </>
      )}
    </main>
  );
}
