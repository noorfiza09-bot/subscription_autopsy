"use client";

type TrialItem = {
  merchantNormalized: string;
  displayName: string;
  amount: number;
  date: string;
  cancellationUrl: string;
};

export function PossibleTrialsCard({
  trials,
  onDismiss,
}: {
  trials: TrialItem[];
  onDismiss: (merchantNormalized: string) => void;
}) {
  if (trials.length === 0) return null;

  return (
    <div className="bg-amber/10 border border-amber/30 rounded-sm px-5 py-4">
      <p className="font-display font-medium text-amber mb-1">👀 Keep an eye on these</p>
      <p className="text-sm text-paper mb-3">
        These charged you once and look like known subscription services — could be a free
        trial about to convert. We'll flag them as a real subscription once they charge again.
      </p>
      <div className="flex flex-col gap-2">
        {trials.map((t) => (
          <div key={t.merchantNormalized} className="flex items-center justify-between gap-3">
            <div className="flex items-baseline flex-1 min-w-0">
              <span className="font-mono text-xs text-paper truncate">{t.displayName}</span>
              <span className="leader" />
              <span className="font-mono text-xs text-slate">₹{t.amount.toFixed(2)}</span>
            </div>
            <a
              href={t.cancellationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono px-2 py-1 border border-amber/40 text-amber rounded-sm hover:bg-amber/10 transition-colors whitespace-nowrap"
            >
              Manage ↗
            </a>
            <button
              onClick={() => onDismiss(t.merchantNormalized)}
              className="text-xs font-mono px-2 py-1 border border-paper/20 text-slate rounded-sm hover:bg-ink-light transition-colors"
              title="Not a trial I need to watch"
            >
              Dismiss
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
