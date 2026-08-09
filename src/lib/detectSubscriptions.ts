import { normalizeMerchant } from "./normalizeMerchant";

export type RawTransaction = {
  date: Date;
  merchantRaw: string;
  amount: number;
};

export type DetectedSubscription = {
  merchantNormalized: string;
  displayName: string;
  amount: number; // most recent / typical amount
  frequency: "WEEKLY" | "MONTHLY" | "YEARLY" | "UNKNOWN";
  lastChargeDate: Date;
  nextExpectedDate: Date | null;
  priceHike: { from: number; to: number } | null;
  occurrences: RawTransaction[];
};

const DAY_MS = 1000 * 60 * 60 * 24;

// Tolerances for calling two intervals "the same cadence".
const FREQUENCY_WINDOWS: { name: DetectedSubscription["frequency"]; days: number; tolerance: number }[] = [
  { name: "WEEKLY", days: 7, tolerance: 2 },
  { name: "MONTHLY", days: 30, tolerance: 4 },
  { name: "YEARLY", days: 365, tolerance: 10 },
];

/**
 * Groups transactions by normalized merchant, then checks whether the
 * group's charges repeat at a consistent interval with a consistent
 * amount. Requires at least 2 occurrences to flag anything (3+ is more
 * confident but 2 lets us surface likely subscriptions sooner).
 */
export function detectSubscriptions(transactions: RawTransaction[]): DetectedSubscription[] {
  const groups = new Map<string, RawTransaction[]>();

  for (const tx of transactions) {
    // Only consider charges (negative/outgoing amounts). Assume amount is
    // positive-magnitude "spent" here; adjust if your CSV encodes sign differently.
    const key = normalizeMerchant(tx.merchantRaw);
    if (!key) continue;
    const list = groups.get(key) ?? [];
    list.push(tx);
    groups.set(key, list);
  }

  const results: DetectedSubscription[] = [];

  for (const [key, txs] of groups) {
    if (txs.length < 2) continue;

    const sorted = [...txs].sort((a, b) => a.date.getTime() - b.date.getTime());

    const intervals: number[] = [];
    for (let i = 1; i < sorted.length; i++) {
      const days = (sorted[i].date.getTime() - sorted[i - 1].date.getTime()) / DAY_MS;
      intervals.push(days);
    }

    const frequency = classifyFrequency(intervals);
    if (frequency === "UNKNOWN") continue;

    // Amount consistency: allow small variance (e.g. currency rounding),
    // but flag a price hike if the most recent charge jumped meaningfully.
    const amounts = sorted.map((t) => t.amount);
    const consistent = isAmountConsistent(amounts);
    if (!consistent) continue;

    const last = sorted[sorted.length - 1];
    const secondLast = sorted[sorted.length - 2];
    const priceHike =
      Math.abs(last.amount - secondLast.amount) / secondLast.amount > 0.05
        ? { from: secondLast.amount, to: last.amount }
        : null;

    const window = FREQUENCY_WINDOWS.find((w) => w.name === frequency)!;
    const nextExpectedDate = new Date(last.date.getTime() + window.days * DAY_MS);

    results.push({
      merchantNormalized: key,
      displayName: titleCase(key),
      amount: last.amount,
      frequency,
      lastChargeDate: last.date,
      nextExpectedDate,
      priceHike,
      occurrences: sorted,
    });
  }

  // Highest spend first — most impactful subscriptions surface at the top.
  return results.sort((a, b) => b.amount - a.amount);
}

function classifyFrequency(intervals: number[]): DetectedSubscription["frequency"] {
  for (const window of FREQUENCY_WINDOWS) {
    const withinWindow = intervals.every(
      (d) => Math.abs(d - window.days) <= window.tolerance
    );
    if (withinWindow) return window.name;
  }
  return "UNKNOWN";
}

function isAmountConsistent(amounts: number[]): boolean {
  const avg = amounts.reduce((a, b) => a + b, 0) / amounts.length;
  // Allow up to ~20% variance across history, since we check price-hike
  // between the last two charges separately with a tighter threshold.
  return amounts.every((a) => Math.abs(a - avg) / avg <= 0.2);
}

function titleCase(s: string): string {
  return s
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}
