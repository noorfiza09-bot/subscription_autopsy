"use client";

type SavedItem = {
  id: string;
  displayName: string;
  amount: number;
  frequency: string;
  cancelledAt: string | null;
  savedSoFar: number;
};

export function MoneySavedCard({
  items,
  totalSaved,
  monthlySavings,
}: {
  items: SavedItem[];
  totalSaved: number;
  monthlySavings: number;
}) {
  if (items.length === 0) return null;

  return (
    <div className="bg-sage/10 border border-sage/30 rounded-sm px-5 py-4">
      <p className="font-display font-medium text-sage mb-1">💰 Money saved</p>
      <p className="text-sm text-paper mb-3">
        You've cancelled {items.length} subscription{items.length !== 1 ? "s" : ""} — roughly{" "}
        <span className="font-mono">₹{totalSaved.toFixed(2)}</span> saved so far, freeing up{" "}
        <span className="font-mono">₹{monthlySavings.toFixed(2)}</span>/month going forward.
      </p>
      <div className="flex flex-col gap-1">
        {items.map((item) => (
          <div key={item.id} className="flex items-baseline text-xs font-mono text-slate">
            <span>{item.displayName}</span>
            <span className="leader" />
            <span>₹{item.savedSoFar.toFixed(2)} saved</span>
          </div>
        ))}
      </div>
    </div>
  );
}
