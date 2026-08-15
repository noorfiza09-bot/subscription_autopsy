import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { UploadForm } from "@/components/UploadForm";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { ReceiptHero } from "@/components/ReceiptHero";
import {
  Upload,
  Search,
  Bell,
  Tags,
  PiggyBank,
  FileDown,
  TrendingUp,
  XCircle,
} from "lucide-react";

const STEPS = [
  {
    number: "01",
    title: "Upload a statement",
    description: "Drop in a bank or card statement — CSV or PDF, whatever your bank gives you.",
    icon: Upload,
  },
  {
    number: "02",
    title: "We find the pattern",
    description:
      "Every charge gets grouped by merchant and checked for a repeating amount and interval — the same thing you'd do by hand, just automatically.",
    icon: Search,
  },
  {
    number: "03",
    title: "You decide what to do",
    description: "Confirm what's really yours, cancel what isn't worth it, and track what you save.",
    icon: TrendingUp,
  },
];

const FEATURES = [
  {
    icon: Bell,
    title: "Price hike alerts",
    description: "Get flagged the moment a subscription quietly charges you more than last time.",
  },
  {
    icon: Tags,
    title: "Auto-categorized",
    description: "Streaming, fitness, software — common merchants get tagged automatically.",
  },
  {
    icon: PiggyBank,
    title: "Money saved tracker",
    description: "Cancel something and watch a running total of what you've actually saved.",
  },
  {
    icon: XCircle,
    title: "One-click cancel links",
    description: "Jump straight to the account page to cancel — no hunting through settings menus.",
  },
  {
    icon: FileDown,
    title: "Exportable reports",
    description: "Download a CSV or a polished PDF summary any time you want the full picture.",
  },
  {
    icon: Bell,
    title: "Renewal reminders",
    description: "An email lands a few days before something's about to charge you again.",
  },
];

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <div className="min-h-screen flex flex-col">
      <Nav />

      {/* Hero */}
      <section className="px-6 pt-10 pb-20 max-w-5xl mx-auto w-full grid md:grid-cols-2 gap-12 items-center">
        <div>
          <p className="font-mono text-xs tracking-widest text-sage uppercase mb-4">
            Itemized receipt · no. 001
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-bold leading-tight mb-5">
            Find every charge you forgot you agreed to.
          </h1>
          <p className="text-slate text-lg mb-8 max-w-md">
            Upload a bank statement. We'll comb through it, catch every
            recurring subscription hiding in there, and tell you exactly
            what it's costing you — including the price hikes you never
            noticed.
          </p>

          {session?.user ? (
            <Link
              href="/dashboard"
              className="inline-block rounded-sm bg-sage px-6 py-3 font-display font-medium text-ink hover:bg-sage/90 transition-colors"
            >
              Go to your dashboard
            </Link>
          ) : (
            <div className="flex gap-3">
              <Link
                href="/signup"
                className="rounded-sm bg-sage px-6 py-3 font-display font-medium text-ink hover:bg-sage/90 transition-colors"
              >
                Get started free
              </Link>
              <Link
                href="/login"
                className="rounded-sm border border-paper/20 px-6 py-3 font-display font-medium text-paper hover:bg-ink-light transition-colors"
              >
                Sign in
              </Link>
            </div>
          )}
        </div>

        <ReceiptHero />
      </section>

      {/* How it works */}
      <section className="px-6 py-16 bg-ink-light">
        <div className="max-w-5xl mx-auto">
          <p className="font-mono text-xs tracking-widest text-sage uppercase mb-2">How it works</p>
          <h2 className="font-display text-2xl font-bold mb-10">Three steps, in order</h2>

          <div className="grid md:grid-cols-3 gap-8">
            {STEPS.map((step) => (
              <div key={step.number}>
                <div className="flex items-center gap-3 mb-3">
                  <span className="font-mono text-xs text-sage">{step.number}</span>
                  <step.icon size={18} className="text-sage" strokeWidth={1.75} />
                </div>
                <h3 className="font-display font-medium text-lg mb-1.5">{step.title}</h3>
                <p className="text-slate text-sm leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-16">
        <div className="max-w-5xl mx-auto">
          <p className="font-mono text-xs tracking-widest text-sage uppercase mb-2">What you get</p>
          <h2 className="font-display text-2xl font-bold mb-10">
            Not just detection — the whole cleanup
          </h2>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-10">
            {FEATURES.map((feature) => (
              <div key={feature.title}>
                <feature.icon size={20} className="text-sage mb-3" strokeWidth={1.75} />
                <h3 className="font-display font-medium mb-1">{feature.title}</h3>
                <p className="text-slate text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Upload / final CTA */}
      <section className="px-6 py-20 bg-ink-light">
        <div className="max-w-md mx-auto text-center">
          <h2 className="font-display text-2xl font-bold mb-2">Ready to see what's leaking?</h2>
          <p className="text-slate mb-8">
            Takes about a minute — upload a statement and we'll do the rest.
          </p>

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
        </div>
      </section>

      <Footer />
    </div>
  );
}
