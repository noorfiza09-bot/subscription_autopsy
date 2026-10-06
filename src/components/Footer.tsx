import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-black/[0.07]">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted">
        <span className="font-medium text-main">Subscription Autopsy</span>
        <span>Built to find the charges you forgot about.</span>
        <div className="flex gap-5">
          <Link href="/login" className="hover:text-main transition-colors">Sign in</Link>
          <Link href="/signup" className="hover:text-main transition-colors">Sign up</Link>
        </div>
      </div>
    </footer>
  );
}
