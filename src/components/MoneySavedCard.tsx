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
    <div className="bg-[#EAF7F0] rounded-2xl px-5 py-5">
      <p className="font-semibold text-sage mb-1">💰 Money saved</p>
      <p className="text-sm text-main mb-3">
        You've cancelled {items.length} subscription{items.length !== 1 ? "s" : ""} — roughly{" "}
        <span className="font-semibold">₹{totalSaved.toFixed(2)}</span> saved so far, freeing up{" "}
        <span className="font-semibold">₹{monthlySavings.toFixed(2)}</span>/month going forward.
      </p>
      <div className="flex flex-col gap-1">
        {items.map((item) => (
          <div key={item.id} className="flex items-baseline text-xs text-muted">
            <span>{item.displayName}</span>
            <span className="leader" />
            <span>₹{item.savedSoFar.toFixed(2)} saved</span>
          </div>
        ))}
      </div>
    </div>
  );
}
