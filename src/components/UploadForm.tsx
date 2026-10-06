"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud } from "lucide-react";

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
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto">
      <label
        htmlFor="statement"
        className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-black/20 bg-white px-8 py-12 text-center cursor-pointer hover:border-brand hover:bg-white transition-colors"
      >
        <UploadCloud className="text-brand" size={28} strokeWidth={1.75} />
        <span className="text-lg font-semibold tracking-tight">
          {file ? file.name : "Drop your statement CSV or PDF here"}
        </span>
        <span className="text-sm text-muted">or click to browse</span>
        <input
          id="statement"
          type="file"
          accept=".csv,.pdf"
          className="hidden"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
      </label>

      <button
        type="submit"
        disabled={!file || status === "uploading"}
        className="mt-4 w-full rounded-lg bg-brand py-3 font-medium text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-brand-dark transition-colors"
      >
        {status === "uploading" ? "Reading statement…" : "Run the autopsy"}
      </button>

      {error && <p className="mt-3 text-sm text-coral">{error}</p>}
    </form>
  );
}
