"use client";

type Direction = "up" | "down" | "left" | "right" | "scale";

const DIRECTION_CLASS: Record<Direction, string> = {
  up: "animate-fade-up",
  down: "animate-fade-down",
  left: "animate-fade-left",
  right: "animate-fade-right",
  scale: "animate-fade-scale",
};

/** Entrance-animation wrapper: starts invisible, revealed by a CSS keyframe with `forwards` fill. */
export function Animate({
  children,
  delay = 0,
  className = "",
  direction = "up",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  direction?: Direction;
}) {
  return (
    <div
      className={`opacity-0 ${DIRECTION_CLASS[direction]} ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
