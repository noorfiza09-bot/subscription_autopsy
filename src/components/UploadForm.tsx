"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function UploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;

    setStatus("uploading");
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();

    if (!res.ok) {
      setStatus("error");
      setError(data.error ?? "Something went wrong.");
      return;
    }

    router.push("/dashboard");
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md">
      <label
        htmlFor="statement"
        className="flex flex-col items-center justify-center gap-2 rounded-sm border border-dashed border-paper/30 bg-ink-light px-8 py-12 text-center cursor-pointer hover:border-sage/60 transition-colors"
      >
        <span className="font-display text-lg">
          {file ? file.name : "Drop your statement CSV here"}
        </span>
        <span className="text-sm text-slate">or click to browse</span>
        <input
          id="statement"
          type="file"
          accept=".csv"
          className="hidden"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
      </label>

      <button
        type="submit"
        disabled={!file || status === "uploading"}
        className="mt-4 w-full rounded-sm bg-sage py-3 font-display font-medium text-ink disabled:opacity-40 disabled:cursor-not-allowed hover:bg-sage/90 transition-colors"
      >
        {status === "uploading" ? "Reading statement…" : "Run the autopsy"}
      </button>

      {error && <p className="mt-3 text-sm text-coral">{error}</p>}
    </form>
  );
}
