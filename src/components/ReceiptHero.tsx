const LINE_ITEMS = [
  { label: "Netflix — quietly went up ₹150/mo", status: "FOUND", delay: 0 },
  { label: "Cult.fit — renews in 3 days", status: "FLAGGED", delay: 0.15 },
  { label: "That trial you forgot to cancel", status: "CAUGHT", delay: 0.3 },
];

export function ReceiptHero() {
  return (
    <div className="bg-paper text-ink rounded-sm w-full max-w-sm mx-auto shadow-2xl shadow-black/40">
      <div className="perforated-top" />
      <div className="px-6 py-6">
        <p className="text-center font-mono text-[10px] tracking-[0.2em] text-slate uppercase">
          Statement of charges you forgot about
        </p>
        <p className="text-center font-display font-bold text-lg mt-1 mb-5">
          Subscription Autopsy
        </p>

        <div className="flex flex-col gap-3">
          {LINE_ITEMS.map((item) => (
            <div
              key={item.label}
              className="flex items-baseline opacity-0 animate-receipt-line"
              style={{ animationDelay: `${item.delay}s` }}
            >
              <span className="font-mono text-xs">{item.label}</span>
              <span className="leader" />
              <span
                className={`font-mono text-xs font-medium ${
                  item.status === "CAUGHT" ? "text-coral" : "text-sage"
                }`}
              >
                {item.status}
              </span>
            </div>
          ))}
        </div>

        <div className="border-t border-dashed border-ink/20 mt-5 pt-4 flex items-baseline">
          <span className="font-display font-bold text-sm">Monthly leakage found</span>
          <span className="leader" />
          <span className="font-mono font-bold text-lg text-coral">₹4,847.00</span>
        </div>

        <div className="mt-6 flex justify-center gap-[3px]" aria-hidden="true">
          {Array.from({ length: 28 }).map((_, i) => (
            <div
              key={i}
              className="bg-ink"
              style={{ width: i % 3 === 0 ? 2 : 1, height: 24 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
