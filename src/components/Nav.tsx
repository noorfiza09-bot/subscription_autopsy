"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

export function Nav() {
  const { data: session, status } = useSession();

  return (
    <nav className="flex items-center justify-between px-6 py-5 max-w-5xl mx-auto">
      <Link href="/" className="flex items-center gap-2">
        <svg width="24" height="24" viewBox="0 0 32 32" className="shrink-0">
          <rect width="32" height="32" rx="6" fill="#6FCF97" />
          <path d="M9 6h14v17l-2.5-2-2.5 2-2.5-2-2.5 2-2.5-2-2.5 2V6z" fill="#0F1B2B" />
          <line x1="12" y1="11" x2="20" y2="11" stroke="#F7F5F0" strokeWidth="1.4" />
          <line x1="12" y1="14.5" x2="20" y2="14.5" stroke="#F7F5F0" strokeWidth="1.4" />
          <line x1="12" y1="18" x2="17" y2="18" stroke="#F7F5F0" strokeWidth="1.6" />
        </svg>
        <span className="font-display font-bold tracking-tight">Subscription Autopsy</span>
      </Link>

      <div className="flex items-center gap-4 text-sm font-mono">
        {status !== "loading" &&
          (session?.user ? (
            <Link href="/dashboard" className="text-slate hover:text-paper transition-colors">
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-slate hover:text-paper transition-colors">
                Sign in
              </Link>
              <Link
                href="/signup"
                className="bg-sage text-ink px-4 py-1.5 rounded-sm font-medium hover:bg-sage/90 transition-colors"
              >
                Get started
              </Link>
            </>
          ))}
      </div>
    </nav>
  );
}
