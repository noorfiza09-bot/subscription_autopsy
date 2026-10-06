"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Menu, X } from "lucide-react";
import { Animate } from "@/components/Animate";

type Variant = "hero" | "light";

function Logo({ variant }: { variant: Variant }) {
  const hero = variant === "hero";
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <svg width="28" height="28" viewBox="0 0 32 32" className="shrink-0 sm:w-[32px] sm:h-[32px]">
        <rect width="32" height="32" rx="7" fill={hero ? "#FFFFFF" : "#0075DE"} />
        <path d="M9 6h14v17l-2.5-2-2.5 2-2.5-2-2.5 2-2.5-2-2.5 2V6z" fill={hero ? "#080A19" : "#FFFFFF"} />
        <line x1="12" y1="11" x2="20" y2="11" stroke={hero ? "#FFFFFF" : "#0075DE"} strokeWidth="1.4" />
        <line x1="12" y1="14.5" x2="20" y2="14.5" stroke={hero ? "#FFFFFF" : "#0075DE"} strokeWidth="1.4" />
        <line x1="12" y1="18" x2="17" y2="18" stroke={hero ? "#FFFFFF" : "#0075DE"} strokeWidth="1.6" />
      </svg>
      <span
        className={`text-[18px] sm:text-[20px] font-[450] leading-none tracking-[-0.02em] ${
          hero ? "text-white" : "text-main"
        }`}
      >
        Subscription Autopsy
      </span>
    </Link>
  );
}

function Wrap({
  hero,
  delay,
  className,
  children,
}: {
  hero: boolean;
  delay: number;
  className?: string;
  children: React.ReactNode;
}) {
  return hero ? (
    <Animate delay={delay} direction="down" className={className}>
      {children}
    </Animate>
  ) : (
    <div className={className}>{children}</div>
  );
}

export function Nav({ variant = "light" }: { variant?: Variant }) {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session, status } = useSession();
  const hero = variant === "hero";
  const signedIn = !!session?.user;
  const ready = status !== "loading";

  // Lock body scroll while the mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const links = [
    { label: "How it works", href: "/#how-it-works" },
    { label: "Features", href: "/#features" },
    { label: "Upload", href: "/#upload" },
  ];

  // Primary / secondary actions depend on auth state.
  const secondary = signedIn
    ? { label: "Settings", href: "/settings" }
    : { label: "Sign in", href: "/login" };
  const primary = signedIn
    ? { label: "Dashboard", href: "/dashboard" }
    : { label: "Get started free", href: "/signup" };

  const linkCls = hero
    ? "text-white/80 hover:text-white text-[14px] font-[450] leading-[14px] transition-colors"
    : "text-main/80 hover:text-main text-[15px] font-[450] transition-colors";

  return (
    <>
      <header
        className={
          hero
            ? "relative z-50"
            : "sticky top-0 z-50 bg-white/90 backdrop-blur-[12px] border-b border-black/[0.07]"
        }
      >
        <nav
          className={`w-full max-w-[1800px] mx-auto px-5 sm:px-8 md:px-[82px] flex items-center justify-between relative z-50 ${
            hero ? "pt-[20px] sm:pt-[30px]" : "h-[64px]"
          }`}
        >
          <Wrap hero={hero} delay={0}>
            <Logo variant={variant} />
          </Wrap>

          {/* Center links */}
          <Wrap hero={hero} delay={100} className="hidden lg:block">
            <div
              className={
                hero
                  ? "h-[52px] px-6 flex items-center gap-[30px] bg-[rgba(10,7,7,0.35)] rounded-[11px] backdrop-blur-[17px]"
                  : "flex items-center gap-8"
              }
            >
              {links.map((l) => (
                <Link key={l.label} href={l.href} className={linkCls}>
                  {l.label}
                </Link>
              ))}
            </div>
          </Wrap>

          {/* Right actions */}
          <Wrap hero={hero} delay={200} className="hidden lg:block">
            {ready &&
              (hero ? (
                <div className="h-[52px] p-[3px] bg-[rgba(0,0,0,0.35)] rounded-[13px] backdrop-blur-[17px] flex items-center gap-[5px]">
                  <Link
                    href={secondary.href}
                    className="h-[46px] px-6 inline-flex items-center rounded-[11px] text-white text-[14px] font-[450] leading-[14px] hover:bg-white/5 transition-colors"
                  >
                    {secondary.label}
                  </Link>
                  <Link
                    href={primary.href}
                    className="h-[46px] px-6 inline-flex items-center bg-[#E9E9E9] rounded-[11px] text-[#0A0707] text-[14px] font-[450] leading-[14px] hover:bg-white transition-colors"
                  >
                    {primary.label}
                  </Link>
                </div>
              ) : (
                <div className="flex items-center gap-5">
                  <Link href={secondary.href} className={linkCls}>
                    {secondary.label}
                  </Link>
                  <Link
                    href={primary.href}
                    className="h-[44px] px-5 inline-flex items-center rounded-lg bg-brand text-white text-[15px] font-medium hover:bg-brand-dark transition-colors"
                  >
                    {primary.label}
                  </Link>
                </div>
              ))}
          </Wrap>

          {/* Mobile hamburger */}
          <Wrap hero={hero} delay={100} className="lg:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
              aria-expanded={isOpen}
              className={`w-[44px] h-[44px] flex items-center justify-center rounded-[11px] transition-colors ${
                hero
                  ? "bg-[rgba(10,7,7,0.35)] backdrop-blur-[17px] hover:bg-white/10"
                  : "hover:bg-black/5"
              }`}
            >
              <div className="relative w-5 h-5">
                <Menu
                  className={`w-5 h-5 ${hero ? "text-white" : "text-main"} absolute inset-0 transition-all duration-300 ease-out ${
                    isOpen ? "opacity-0 rotate-90 scale-75" : "opacity-100 rotate-0 scale-100"
                  }`}
                />
                <X
                  className={`w-5 h-5 ${hero ? "text-white" : "text-main"} absolute inset-0 transition-all duration-300 ease-out ${
                    isOpen ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-75"
                  }`}
                />
              </div>
            </button>
          </Wrap>
        </nav>
      </header>

      {/* Mobile menu overlay — visibility-toggled so it animates both ways */}
      <div
        className={`lg:hidden fixed inset-0 z-40 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          isOpen ? "visible" : "invisible"
        }`}
      >
        <div
          onClick={() => setIsOpen(false)}
          className={`absolute inset-0 backdrop-blur-[24px] transition-opacity duration-500 ${
            hero ? "bg-night/90" : "bg-white/90"
          } ${isOpen ? "opacity-100" : "opacity-0"}`}
        />

        <div
          className={`absolute ${
            hero ? "top-[76px] sm:top-[86px]" : "top-[72px]"
          } left-4 right-4 sm:left-6 sm:right-6 rounded-[20px] p-6 sm:p-8 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] origin-top ${
            hero
              ? "bg-[rgba(17,16,15,0.6)] backdrop-blur-[30px] border border-white/[0.06]"
              : "bg-white border border-black/10 shadow-xl"
          } ${isOpen ? "opacity-100 translate-y-0 scale-100" : "opacity-0 -translate-y-4 scale-[0.97]"}`}
        >
          <div className="flex flex-col gap-1">
            {links.map((l, i) => (
              <Link
                key={l.label}
                href={l.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center justify-between px-4 py-4 rounded-[12px] text-[18px] font-[450] transition-all duration-300 ${
                  hero ? "text-white/90 hover:bg-white/[0.06]" : "text-main hover:bg-soft"
                } ${isOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-3"}`}
                style={{ transitionDelay: isOpen ? `${100 + i * 50}ms` : "0ms" }}
              >
                {l.label}
              </Link>
            ))}
          </div>

          <div className={`h-px my-5 ${hero ? "bg-white/10" : "bg-black/10"}`} />

          <div
            className={`flex flex-col gap-3 transition-all duration-300 ${
              isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            }`}
            style={{ transitionDelay: isOpen ? "350ms" : "0ms" }}
          >
            {ready && (
              <>
                <Link
                  href={primary.href}
                  onClick={() => setIsOpen(false)}
                  className={`w-full h-[50px] inline-flex items-center justify-center rounded-[12px] text-[15px] font-[450] transition-colors ${
                    hero
                      ? "bg-[#E9E9E9] text-[#0A0707] hover:bg-white"
                      : "bg-brand text-white hover:bg-brand-dark"
                  }`}
                >
                  {primary.label}
                </Link>
                <Link
                  href={secondary.href}
                  onClick={() => setIsOpen(false)}
                  className={`w-full h-[50px] inline-flex items-center justify-center rounded-[12px] border text-[15px] font-[450] transition-colors ${
                    hero
                      ? "border-white/30 text-white hover:bg-white/5"
                      : "border-black/15 text-main hover:bg-soft"
                  }`}
                >
                  {secondary.label}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
