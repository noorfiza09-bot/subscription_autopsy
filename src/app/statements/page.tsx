"use client";

import { useEffect, useState } from "react";
import { Nav } from "@/components/Nav";

type StatementItem = {
  id: string;
  filename: string;
  uploadedAt: string;
  transactionCount: number;
};

export default function StatementsPage() {
  const [statements, setStatements] = useState<StatementItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/statements")
      .then((r) => r.json())
      .then((data) => {
        setStatements(data);
        setLoading(false);
      });
  }, []);

  async function handleDelete(id: string) {
    setDeletingId(id);
    await fetch(`/api/statements/${id}`, { method: "DELETE" });
    setStatements((prev) => prev.filter((s) => s.id !== id));
    setDeletingId(null);
  }

  return (
    <>
      <Nav />
      <main className="min-h-screen px-6 py-10 max-w-2xl mx-auto">
        <p className="font-mono text-xs tracking-widest text-sage uppercase mb-2">
          Itemized receipt · upload history
        </p>
        <h1 className="font-display text-3xl font-bold mb-1">Statement history</h1>
        <p className="text-slate mb-8">
          Every statement you've uploaded. Deleting one removes its transactions and
          re-checks which subscriptions are still supported by your remaining data.
        </p>

        {loading && (
          <div className="flex flex-col gap-3">
            {[0, 1].map((i) => (
              <div key={i} className="h-16 rounded-sm bg-ink-light animate-pulse" />
            ))}
          </div>
        )}

        {!loading && statements.length === 0 && (
          <div className="border border-dashed border-paper/20 rounded-sm px-6 py-12 text-center">
            <p className="font-display text-lg mb-1">No statements yet</p>
            <p className="text-slate text-sm">
              Upload one from the home page to see it show up here.
            </p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {statements.map((s) => (
            <div
              key={s.id}
              className="bg-paper text-ink rounded-sm overflow-hidden"
            >
              <div className="perforated-top" />
              <div className="px-5 py-4 flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <p className="font-display font-medium">{s.filename}</p>
                  <p className="text-xs font-mono text-slate mt-0.5">
                    {new Date(s.uploadedAt).toLocaleString()} · {s.transactionCount}{" "}
                    transaction{s.transactionCount !== 1 ? "s" : ""}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(s.id)}
                  disabled={deletingId === s.id}
                  className="text-xs font-mono px-3 py-1.5 border border-coral/40 text-coral rounded-sm hover:bg-coral/10 transition-colors disabled:opacity-40"
                >
                  {deletingId === s.id ? "Removing…" : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
