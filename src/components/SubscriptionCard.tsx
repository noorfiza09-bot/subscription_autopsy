"use client";

const CATEGORIES = ["Streaming", "Fitness", "Software", "Shopping", "Utilities", "Other"];

type Subscription = {
  id: string;
  displayName: string;
  amount: number;
  previousAmount: number | null;
  frequency: string;
  lastChargeDate: string;
  nextExpectedDate: string | null;
  isConfirmed: boolean;
  category: string | null;
};

export function SubscriptionCard({
  sub,
  onConfirm,
  onDismiss,
  onCategoryChange,
}: {
  sub: Subscription;
  onConfirm: (id: string) => void;
  onDismiss: (id: string) => void;
  onCategoryChange: (id: string, category: string) => void;
}) {
  return (
    <div className="bg-paper text-ink rounded-sm overflow-hidden">
      <div className="perforated-top" />
      <div className="px-5 py-4">
        <div className="flex items-baseline">
          <span className="font-display font-medium">{sub.displayName}</span>
          <span className="leader" />
          <span className="font-mono font-medium">₹{sub.amount.toFixed(2)}</span>
        </div>

        {sub.previousAmount != null && sub.previousAmount !== sub.amount && (
          <div className="text-xs font-mono text-coral mt-0.5">
            ▲ went up from ₹{sub.previousAmount.toFixed(2)}
          </div>
        )}

        <div className="flex items-center justify-between mt-1 text-xs text-slate font-mono">
          <span>
            {sub.frequency.toLowerCase()} · next ~
            {sub.nextExpectedDate
              ? new Date(sub.nextExpectedDate).toLocaleDateString()
              : "unknown"}
          </span>
          {!sub.isConfirmed && (
            <span className="text-amber uppercase tracking-wide">unconfirmed</span>
          )}
        </div>

        <div className="flex items-center gap-3 mt-3 flex-wrap">
          {!sub.isConfirmed && (
            <button
              onClick={() => onConfirm(sub.id)}
              className="text-xs font-mono px-3 py-1 bg-ink text-paper rounded-sm hover:bg-ink-light transition-colors"
            >
              Yep, that's mine
            </button>
          )}
          <button
            onClick={() => onDismiss(sub.id)}
            className="text-xs font-mono px-3 py-1 border border-ink/20 rounded-sm hover:bg-paper-dim transition-colors"
          >
            Not a subscription
          </button>

          <select
            value={sub.category ?? ""}
            onChange={(e) => onCategoryChange(sub.id, e.target.value)}
            className="text-xs font-mono px-2 py-1 border border-ink/20 rounded-sm bg-paper text-ink ml-auto"
          >
            <option value="" disabled>
              Categorize…
            </option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
