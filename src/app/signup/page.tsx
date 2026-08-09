"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();

    if (!res.ok) {
      setLoading(false);
      setError(data.error ?? "Something went wrong.");
      return;
    }

    // Auto sign-in right after account creation.
    const signInRes = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);

    if (signInRes?.error) {
      setError("Account created — please sign in.");
      router.push("/login");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-20">
      <div className="max-w-sm w-full">
        <p className="font-mono text-xs tracking-widest text-sage uppercase mb-3 text-center">
          Itemized receipt · new account
        </p>
        <h1 className="font-display text-3xl font-bold mb-8 text-center">Create your account</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Name (optional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-ink-light border border-paper/20 rounded-sm px-4 py-3 text-paper placeholder:text-slate focus:outline-none focus:border-sage/60"
          />
          <input
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-ink-light border border-paper/20 rounded-sm px-4 py-3 text-paper placeholder:text-slate focus:outline-none focus:border-sage/60"
          />
          <input
            type="password"
            placeholder="Password (min 8 characters)"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-ink-light border border-paper/20 rounded-sm px-4 py-3 text-paper placeholder:text-slate focus:outline-none focus:border-sage/60"
          />

          {error && <p className="text-sm text-coral">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-sm bg-sage py-3 font-display font-medium text-ink disabled:opacity-40 hover:bg-sage/90 transition-colors"
          >
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="text-sm text-slate text-center mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-sage hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
