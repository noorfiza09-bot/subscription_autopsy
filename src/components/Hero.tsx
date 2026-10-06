"use client";

import Link from "next/link";
import { Animate } from "@/components/Animate";
import { Nav } from "@/components/Nav";
import { HeroBackground } from "@/components/HeroBackground";

const BAR_HEIGHTS = [
  23, 40, 53, 40, 33, 14, 7, 17, 75, 65,
  88, 75, 65, 47, 33, 88, 4, 7, 9, 14,
  95, 65, 79, 37, 7, 40, 17, 20, 62, 47,
  92, 72,
];

const AXIS = ["Jun", "Jul", "Aug", "Sep", "Oct"];

function LeakageCard() {
  const maxHeight = Math.max(...BAR_HEIGHTS);

  return (
    <Animate delay={900} direction="scale" className="w-full max-w-[405px] mx-auto lg:mx-0">
      <div className="w-full rounded-[24px] sm:rounded-[33px] bg-[rgba(17,16,15,0.35)] backdrop-blur-[20px] p-5 sm:p-8 pb-5 sm:pb-6">
        <p className="text-white text-[16px] sm:text-[20px] font-[450] leading-[20px] mb-3 sm:mb-4">
          Monthly leakage found
        </p>

        <p className="mb-2 sm:mb-3">
          <span className="text-white text-[28px] sm:text-[46px] font-[450] leading-[1]">₹4,847</span>
          <span className="text-white/20 text-[28px] sm:text-[46px] font-[450] leading-[1]">.00</span>
        </p>

        <div className="flex items-center gap-[10px] mb-6 sm:mb-8">
          <span className="px-[6px] py-[7px] bg-white/20 rounded-[6px] text-white text-[12px] sm:text-[14px] font-[450] leading-[14px]">
            +3.2%
          </span>
          <span className="text-white/80 text-[12px] sm:text-[14px] font-[450] leading-[14px] opacity-70">
            vs. last statement (₹4,697)
          </span>
        </div>

        <div className="relative">
          <div className="flex items-end gap-[1.5px] h-[80px] sm:h-[100px]">
            {BAR_HEIGHTS.map((h, i) => {
              const isProjected = i >= 28;
              return (
                <div
                  key={i}
                  className="flex-1 rounded-[0.5px] animate-bar-grow origin-bottom"
                  style={{
                    height: `${(h / maxHeight) * 100}%`,
                    backgroundColor: isProjected ? "rgba(255,255,255,0.1)" : "white",
                    animationDelay: `${1100 + i * 30}ms`,
                  }}
                />
              );
            })}
          </div>

          <div className="absolute inset-0 pointer-events-none">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="absolute top-0 bottom-0 w-px bg-white/10"
                style={{ left: `${((i + 1) / 5) * 100}%` }}
              />
            ))}
          </div>

          <div className="flex justify-between mt-3">
            {AXIS.map((label, i) => (
              <span
                key={`${label}-${i}`}
                className="text-[9px] sm:text-[10px] font-[450] leading-[10px] text-white/80"
                style={{ opacity: i >= 3 ? 0.4 : 1 }}
              >
                {label}
              </span>
            ))}
          </div>
        </div>

        <p className="mt-4 text-[10px] text-white/40">Illustrative example</p>
      </div>
    </Animate>
  );
}

export default function Hero({ signedIn }: { signedIn: boolean }) {
  return (
    <section className="relative w-full min-h-screen lg:h-screen overflow-hidden bg-night font-hero">
      <HeroBackground />

      <div className="relative z-10 min-h-screen lg:h-full flex flex-col">
        <Nav variant="hero" />

        <div className="flex-1 flex items-center py-8">
          <div className="w-full max-w-[1800px] mx-auto px-5 sm:px-8 md:px-[82px] flex flex-col lg:flex-row lg:items-center lg:justify-between gap-10 lg:gap-12">
            <div className="max-w-[593px]">
              <Animate delay={300} direction="up">
                <h1 className="text-white text-[36px] sm:text-[52px] md:text-[64px] lg:text-[72px] font-normal leading-[0.95] mb-5 sm:mb-8">
                  Find every charge you forgot you agreed to
                </h1>
              </Animate>

              <Animate delay={500} direction="up">
                <p className="text-white/80 text-[16px] sm:text-[18px] md:text-[20px] font-[450] leading-[1.3] max-w-[370px] mb-7 sm:mb-10">
                  Upload a statement. We catch every hidden subscription and quiet price hike
                </p>
              </Animate>

              <Animate delay={700} direction="up">
                <div className="flex flex-wrap gap-3 sm:gap-4">
                  <Link
                    href={signedIn ? "/dashboard" : "/signup"}
                    className="h-[46px] sm:h-[51px] px-5 sm:px-[27px] inline-flex items-center justify-center bg-[#E9E9E9] rounded-[12px] text-[#0A0707] text-[14px] sm:text-[15.5px] font-[450] leading-[15.5px] transition-opacity hover:opacity-90"
                  >
                    {signedIn ? "Go to your dashboard" : "Get started free"}
                  </Link>
                  <Link
                    href={signedIn ? "/#upload" : "/login"}
                    className="h-[46px] sm:h-[51px] px-5 sm:px-[27px] inline-flex items-center justify-center rounded-[12px] border border-white text-white text-[14px] sm:text-[15.5px] font-[450] leading-[15.5px] transition-opacity hover:opacity-80"
                  >
                    {signedIn ? "Upload a statement" : "Sign in"}
                  </Link>
                </div>
              </Animate>
            </div>

            <LeakageCard />
          </div>
        </div>
      </div>
    </section>
  );
}
