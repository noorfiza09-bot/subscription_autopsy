"use client";

import { useEffect, useMemo, useState } from "react";
import { signOut } from "next-auth/react";
import { SubscriptionCard } from "@/components/SubscriptionCard";
import { CategoryBreakdownChart } from "@/components/CategoryBreakdownChart";
import { SpendTrendChart } from "@/components/SpendTrendChart";
import { MoneySavedCard } from "@/components/MoneySavedCard";
import { generatePdfReport } from "@/lib/pdfReport";

type Subscription = {
  id: string;
  displayName: string;
  merchantNormalized: string;
  amount: number;
  previousAmount: number | null;
  frequency: string;
  lastChargeDate: string;
  nextExpectedDate: string | null;
  isConfirmed: boolean;
  isDismissed: boolean;
  category: string | null;
  lastReminderSentAt: string | null;
};

type TrendPoint = { month: string; total: number };

type SavedItem = {
  id: string;
  displayName: string;
  amount: number;
  frequency: string;
  cancelledAt: string | null;
  savedSoFar: number;
};

function monthlyEquivalent(sub: Subscription) {
  const multiplier =
    sub.frequency === "YEARLY" ? 1 / 12 : sub.frequency === "WEEKLY" ? 4.33 : 1;
  return sub.amount * multiplier;
}

function downloadCsv(subs: Subscription[]) {
  const header = ["Merchant", "Amount", "Frequency", "Category", "Next Expected", "Confirmed"];
  const rows = subs.map((s) => [
    s.displayName,
    s.amount.toFixed(2),
    s.frequency,
    s.category ?? "Uncategorized",
    s.nextExpectedDate ? new Date(s.nextExpectedDate).toLocaleDateString() : "",
    s.isConfirmed ? "Yes" : "No",
  ]);
  const csv = [header, ...rows].map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "subscription-report.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export default function Dashboard() {
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [trend, setTrend] = useState<TrendPoint[]>([]);
  const [savings, setSavings] = useState<{
    items: SavedItem[];
    totalSaved: number;
    monthlySavings: number;
  }>({ items: [], totalSaved: 0, monthlySavings: 0 });
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(true);
  const [monthlyBudget, setMonthlyBudget] = useState<number | null>(null);
  const [budgetInput, setBudgetInput] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/subscriptions").then((r) => r.json()),
      fetch("/api/subscriptions/trend").then((r) => r.json()),
      fetch("/api/subscriptions/savings").then((r) => r.json()),
      fetch("/api/user/settings").then((r) => r.json()),
    ]).then(([subsData, trendData, savingsData, settingsData]) => {
      setSubs(subsData);
      setTrend(trendData);
      setSavings(savingsData);
      setEmailNotificationsEnabled(settingsData.emailNotificationsEnabled);
      setMonthlyBudget(settingsData.monthlyBudget);
      setBudgetInput(settingsData.monthlyBudget != null ? String(settingsData.monthlyBudget) : "");
      setLoading(false);
    });
  }, []);

  async function toggleEmailNotifications() {
    const next = !emailNotificationsEnabled;
    setEmailNotificationsEnabled(next);
    await fetch("/api/user/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emailNotificationsEnabled: next }),
    });
  }

  async function saveBudget() {
    const value = budgetInput.trim() === "" ? null : Number(budgetInput);
    setMonthlyBudget(value);
    await fetch("/api/user/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ monthlyBudget: value }),
    });
  }

  async function patchSub(id: string, body: Partial<Subscription> & { wasCancelled?: boolean }) {
    await fetch(`/api/subscriptions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (body.isDismissed) {
      setSubs((prev) => prev.filter((s) => s.id !== id));
      if (body.wasCancelled) {
        // Refresh savings so the tracker reflects the new cancellation
        // immediately instead of waiting for a page reload.
        fetch("/api/subscriptions/savings")
          .then((r) => r.json())
          .then(setSavings);
      }
    } else {
      setSubs((prev) => prev.map((s) => (s.id === id ? { ...s, ...body } : s)));
    }
  }

  const monthlyTotal = subs.reduce((sum, s) => sum + monthlyEquivalent(s), 0);
  const overBudget = monthlyBudget != null && monthlyTotal > monthlyBudget;

  const categoryTotals = Object.values(
    subs.reduce<Record<string, { category: string; total: number }>>((acc, s) => {
      const key = s.category ?? "Uncategorized";
      acc[key] = acc[key] ?? { category: key, total: 0 };
      acc[key].total += monthlyEquivalent(s);
      return acc;
    }, {})
  ).sort((a, b) => b.total - a.total);

  const availableCategories = useMemo(
    () => ["All", ...Array.from(new Set(subs.map((s) => s.category ?? "Uncategorized")))],
    [subs]
  );

  const visibleSubs =
    categoryFilter === "All"
      ? subs
      : subs.filter((s) => (s.category ?? "Uncategorized") === categoryFilter);

  return (
    <main className="min-h-screen px-6 py-16 max-w-2xl mx-auto">
      <p className="font-mono text-xs tracking-widest text-sage uppercase mb-2">
        Itemized receipt · monthly summary
      </p>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold mb-1">Your recurring spend</h1>
          <p className="text-slate mb-2">
            {subs.length} subscription{subs.length !== 1 ? "s" : ""} detected · roughly{" "}
            <span className="font-mono text-paper">₹{monthlyTotal.toFixed(2)}</span> / month
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleEmailNotifications}
            className="flex items-center gap-2 text-xs font-mono px-3 py-1.5 border border-paper/20 rounded-sm hover:bg-ink-light transition-colors whitespace-nowrap"
            title="Toggle email renewal reminders"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                emailNotificationsEnabled ? "bg-sage" : "bg-slate"
              }`}
            />
            Email reminders {emailNotificationsEnabled ? "on" : "off"}
          </button>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="text-xs font-mono px-3 py-1.5 border border-paper/20 rounded-sm hover:bg-ink-light transition-colors whitespace-nowrap"
          >
            Sign out
          </button>
        </div>
      </div>

      {/* Budget setting */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <label className="text-xs font-mono text-slate">Monthly budget ₹</label>
        <input
          type="number"
          value={budgetInput}
          onChange={(e) => setBudgetInput(e.target.value)}
          onBlur={saveBudget}
          placeholder="none set"
          className="w-28 text-xs font-mono px-2 py-1 border border-paper/20 rounded-sm bg-ink-light text-paper"
        />
        {monthlyBudget != null && (
          <span className={`text-xs font-mono ${overBudget ? "text-coral" : "text-sage"}`}>
            {overBudget
              ? `▲ ₹${(monthlyTotal - monthlyBudget).toFixed(2)} over budget`
              : `✓ ₹${(monthlyBudget - monthlyTotal).toFixed(2)} under budget`}
          </span>
        )}
      </div>

      {loading && (
        <div className="flex flex-col gap-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-24 rounded-sm bg-ink-light animate-pulse" />
          ))}
        </div>
      )}

      {!loading && subs.length === 0 && savings.items.length === 0 && (
        <div className="border border-dashed border-paper/20 rounded-sm px-6 py-12 text-center">
          <p className="font-display text-lg mb-1">Nothing here yet</p>
          <p className="text-slate text-sm">
            Upload a statement from the home page and we'll comb through it for
            recurring charges.
          </p>
        </div>
      )}

      {!loading && (subs.length > 0 || savings.items.length > 0) && (
        <>
          <div className="flex flex-col gap-4 mb-6">
            <MoneySavedCard
              items={savings.items}
              totalSaved={savings.totalSaved}
              monthlySavings={savings.monthlySavings}
            />
            {subs.length > 0 && <CategoryBreakdownChart data={categoryTotals} />}
            {subs.length > 0 && <SpendTrendChart data={trend} />}
          </div>

          {subs.length > 0 && (
            <>
              <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="text-xs font-mono px-2 py-1.5 border border-paper/20 rounded-sm bg-ink-light text-paper"
                >
                  {availableCategories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>

                <div className="flex gap-2">
                  <button
                    onClick={() => downloadCsv(subs)}
                    className="text-xs font-mono px-3 py-1.5 border border-paper/20 rounded-sm hover:bg-ink-light transition-colors"
                  >
                    Export CSV
                  </button>
                  <button
                    onClick={() => generatePdfReport(subs, monthlyTotal, monthlyBudget)}
                    className="text-xs font-mono px-3 py-1.5 border border-paper/20 rounded-sm hover:bg-ink-light transition-colors"
                  >
                    Download PDF
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                {visibleSubs.map((sub) => (
                  <SubscriptionCard
                    key={sub.id}
                    sub={sub}
                    onConfirm={(id) => patchSub(id, { isConfirmed: true })}
                    onDismiss={(id) => patchSub(id, { isDismissed: true })}
                    onCancel={(id) => patchSub(id, { isDismissed: true, wasCancelled: true })}
                    onCategoryChange={(id, category) => patchSub(id, { category })}
                  />
                ))}
                {visibleSubs.length === 0 && (
                  <p className="text-slate text-sm text-center py-6">
                    No subscriptions in this category.
                  </p>
                )}
              </div>
            </>
          )}
        </>
      )}
    </main>
  );
}
