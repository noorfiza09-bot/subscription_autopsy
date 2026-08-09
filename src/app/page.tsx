import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { UploadForm } from "@/components/UploadForm";

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-20">
      <div className="max-w-md w-full text-center mb-10">
        <p className="font-mono text-xs tracking-widest text-sage uppercase mb-3">
          Itemized receipt · no. 001
        </p>
        <h1 className="font-display text-4xl font-bold mb-4 leading-tight">
          Subscription Autopsy
        </h1>
        <p className="text-slate">
          Upload a bank or card statement. We'll find every recurring charge
          you forgot you agreed to — and tell you exactly what it's costing
          you.
        </p>
      </div>

      {session?.user ? (
        <UploadForm />
      ) : (
        <div className="flex flex-col items-center gap-3">
          <p className="text-slate text-sm">Sign in to upload a statement.</p>
          <div className="flex gap-3">
            <Link
              href="/login"
              className="rounded-sm bg-sage px-6 py-3 font-display font-medium text-ink hover:bg-sage/90 transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="rounded-sm border border-paper/20 px-6 py-3 font-display font-medium text-paper hover:bg-ink-light transition-colors"
            >
              Create account
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}
