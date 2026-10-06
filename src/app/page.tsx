import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { UploadForm } from "@/components/UploadForm";
import { Footer } from "@/components/Footer";
import Hero from "@/components/Hero";
import {
  Upload,
  Search,
  Bell,
  Tags,
  PiggyBank,
  FileDown,
  TrendingUp,
  XCircle,
  TrendingDown,
} from "lucide-react";

const STEPS = [
  {
    number: "01",
    title: "Upload a statement",
    description: "Drop in a bank or card statement — CSV or PDF, whatever your bank gives you.",
    icon: Upload,
    color: "#0075DE",
    bg: "#E6F1FC",
  },
  {
    number: "02",
    title: "We find the pattern",
    description:
      "Every charge gets grouped by merchant and checked for a repeating amount and interval — the same thing you'd do by hand, just automatically.",
    icon: Search,
    color: "#1B9A8A",
    bg: "#E3F5F2",
  },
  {
    number: "03",
    title: "You decide what to do",
    description: "Confirm what's really yours, cancel what isn't worth it, and track what you save.",
    icon: TrendingUp,
    color: "#7C5CE0",
    bg: "#EFEAFB",
  },
];

const SMALL_FEATURES = [
  {
    icon: Tags,
    title: "Auto-categorized",
    description: "Streaming, fitness, software — common merchants get tagged automatically.",
    color: "#1B9A8A",
  },
  {
    icon: XCircle,
    title: "One-click cancel links",
    description: "Jump straight to the account page to cancel — no hunting through settings menus.",
    color: "#E0453A",
  },
  {
    icon: FileDown,
    title: "Exportable reports",
    description: "Download a CSV or a polished PDF summary any time you want the full picture.",
    color: "#7C5CE0",
  },
  {
    icon: Bell,
    title: "Renewal reminders",
    description: "An email lands a few days before something's about to charge you again.",
    color: "#D98A1A",
  },
];

export default async function Home() {
  const session = await getServerSession(authOptions);
  const signedIn = !!session?.user;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Hero signedIn={signedIn} />

      {/* How it works */}
      <section id="how-it-works" className="scroll-mt-20 px-5 sm:px-8 pt-24 pb-10">
        <div className="max-w-[1200px] mx-auto">
          <p className="text-sm font-medium text-brand mb-3">How it works</p>
          <h2 className="text-4xl md:text-5xl font-bold leading-[1.05] mb-12 max-w-[640px]">
            Three steps, in order.
          </h2>

          <div className="grid md:grid-cols-3 gap-5">
            {STEPS.map((step) => (
              <div key={step.number} className="rounded-3xl bg-soft p-7 sm:p-8">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-8"
                  style={{ backgroundColor: step.bg }}
                >
                  <step.icon size={22} style={{ color: step.color }} strokeWidth={1.9} />
                </div>
                <p className="text-sm text-muted mb-1">Step {step.number}</p>
                <h3 className="text-2xl font-bold mb-2">{step.title}</h3>
                <p className="text-muted leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="scroll-mt-20 px-5 sm:px-8 py-16">
        <div className="max-w-[1200px] mx-auto">
          <p className="text-sm font-medium text-brand mb-3">What you get</p>
          <h2 className="text-4xl md:text-5xl font-bold leading-[1.05] mb-12 max-w-[760px]">
            Not just detection — the whole cleanup.
          </h2>

          {/* Two large feature tiles */}
          <div className="grid lg:grid-cols-[2fr_1fr] gap-5 mb-5">
            <div className="rounded-3xl bg-soft p-7 sm:p-9 flex flex-col sm:flex-row sm:items-center gap-8 min-h-[320px]">
              <div className="flex-1">
                <p className="flex items-center gap-2 text-sm text-muted mb-4">
                  <Bell size={14} className="text-brand" /> Price hike alerts
                </p>
                <h3 className="text-3xl font-bold mb-3">Know the moment a price quietly goes up.</h3>
                <p className="text-muted leading-relaxed max-w-md">
                  Get flagged the moment a subscription charges you more than last time.
                </p>
              </div>
              <div className="w-full sm:w-[260px] rounded-2xl bg-white border border-black/[0.06] shadow-sm p-5">
                <div className="flex items-baseline justify-between">
                  <span className="font-semibold">Netflix</span>
                  <span className="font-semibold">₹649.00</span>
                </div>
                <p className="flex items-center gap-1 text-xs text-coral mt-1">
                  <TrendingDown size={12} className="rotate-180" /> went up from ₹499.00
                </p>
                <div className="h-px bg-black/[0.07] my-4" />
                <div className="flex items-baseline justify-between">
                  <span className="font-semibold">Cult.fit</span>
                  <span className="font-semibold">₹1,200.00</span>
                </div>
                <p className="text-xs text-amber mt-1">renews in 3 days</p>
              </div>
            </div>

            <div className="rounded-3xl bg-tint p-7 sm:p-9 flex flex-col justify-between min-h-[320px]">
              <div>
                <p className="flex items-center gap-2 text-sm text-muted mb-4">
                  <PiggyBank size={14} className="text-brand" /> Money saved tracker
                </p>
                <h3 className="text-3xl font-bold mb-3">Watch the savings add up.</h3>
                <p className="text-muted leading-relaxed">
                  Cancel something and watch a running total of what you've actually saved.
                </p>
              </div>
              <div className="mt-6 self-end w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-sm">
                <PiggyBank size={40} className="text-brand" strokeWidth={1.5} />
              </div>
            </div>
          </div>

          {/* Four compact feature cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {SMALL_FEATURES.map((feature) => (
              <div key={feature.title} className="rounded-2xl bg-soft p-6 min-h-[200px]">
                <feature.icon size={26} style={{ color: feature.color }} className="mb-8" strokeWidth={1.9} />
                <h3 className="text-xl font-bold mb-1.5">{feature.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Upload / final CTA */}
      <section id="upload" className="scroll-mt-20 px-5 sm:px-8 pt-8 pb-24">
        <div className="max-w-[1200px] mx-auto rounded-[28px] bg-tint px-6 sm:px-10 py-16 text-center">
          <h2 className="text-4xl md:text-5xl font-bold leading-[1.05] mb-3">
            Ready to see what's leaking?
          </h2>
          <p className="text-muted text-lg mb-10">
            Takes about a minute — upload a statement and we'll do the rest.
          </p>

          {signedIn ? (
            <UploadForm />
          ) : (
            <div className="flex flex-col items-center gap-4">
              <p className="text-muted text-sm">Sign in to upload a statement.</p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link
                  href="/signup"
                  className="h-[48px] px-6 inline-flex items-center rounded-lg bg-brand text-white font-medium hover:bg-brand-dark transition-colors"
                >
                  Create account
                </Link>
                <Link
                  href="/login"
                  className="h-[48px] px-6 inline-flex items-center rounded-lg bg-white text-brand font-medium hover:bg-white/70 transition-colors"
                >
                  Sign in
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
