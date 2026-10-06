// Pure-CSS animated backdrop: slow-moving blue light + subscription charges drifting upward.
const CHIPS = [
  { text: "Netflix  ₹649", tag: "▲ price hike", left: "6%", dur: 22, delay: -4, hide: false },
  { text: "Spotify  ₹119", tag: "monthly", left: "20%", dur: 28, delay: -16, hide: true },
  { text: "Cult.fit  ₹1,200", tag: "renews in 3 days", left: "34%", dur: 25, delay: -9, hide: false },
  { text: "iCloud  ₹75", tag: "monthly", left: "48%", dur: 30, delay: -21, hide: true },
  { text: "Prime  ₹1,499", tag: "yearly", left: "60%", dur: 24, delay: -2, hide: false },
  { text: "Free trial ended", tag: "now charging ₹399", left: "73%", dur: 27, delay: -13, hide: true },
  { text: "Adobe  ₹1,675", tag: "▲ price hike", left: "84%", dur: 23, delay: -7, hide: false },
  { text: "YouTube Premium  ₹149", tag: "monthly", left: "12%", dur: 31, delay: -26, hide: true },
];

export function HeroBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-night" aria-hidden="true">
      {/* Drifting light */}
      <div className="hero-blob hero-blob-a" />
      <div className="hero-blob hero-blob-b" />
      <div className="hero-blob hero-blob-c" />

      {/* Faint ledger grid */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
        }}
      />

      {/* Floating charges */}
      {CHIPS.map((c) => (
        <div
          key={c.text}
          className={`hero-chip ${c.hide ? "hidden sm:flex" : "flex"}`}
          style={{
            left: c.left,
            animationDuration: `${c.dur}s`,
            animationDelay: `${c.delay}s`,
          }}
        >
          <span className="text-white/90 text-[13px] font-[450]">{c.text}</span>
          <span className={`text-[11px] ${c.tag.startsWith("▲") ? "text-[#FF8A80]" : "text-white/50"}`}>
            {c.tag}
          </span>
        </div>
      ))}

      {/* Keeps text readable over the chips */}
      <div className="absolute inset-0 bg-gradient-to-b from-night/40 via-transparent to-night/60" />
    </div>
  );
}
