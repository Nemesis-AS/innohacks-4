"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

import { PIXEL_FONT } from "@/util/ui";

/**
 * Enchantment glint — a pair of hard-edged bands sweeping across the button, the way
 * an enchanted item shimmers in-game. Hard colour stops rather than a soft gradient:
 * a blurred sheen reads as generic web chrome next to the pixel art.
 */
export function Glint({ delay = 0 }: { delay?: number }) {
  return (
    <motion.span
      aria-hidden
      className="pointer-events-none absolute inset-y-0 left-0"
      style={{
        width: "140%",
        background:
          "linear-gradient(115deg, transparent 0 40%, rgba(255,255,255,0.30) 40% 46%, transparent 46% 53%, rgba(255,255,255,0.50) 53% 59%, transparent 59%)",
      }}
      initial={{ x: "-140%" }}
      animate={{ x: "140%" }}
      // `delay` applies to the first pass only, so it offsets the whole loop —
      // which is what staggers a row of glinting buttons out of lockstep.
      transition={{ duration: 1.2, ease: "easeInOut", repeat: Infinity, repeatDelay: 3, delay }}
    />
  );
}

type MinecraftButtonProps = {
  href: string;
  /** Fill. Defaults to the grass green. */
  color?: string;
  /** Bevel frame. Pass a dark shade of `color`. */
  borderColor?: string;
  /** Defaults to white with a dark drop shadow; pass a dark ink for bright fills. */
  textColor?: string;
  /** Slow enchantment shimmer. */
  glint?: boolean;
  /** Seconds to offset the glint loop by, to stagger a row of glinting buttons. */
  glintDelay?: number;
  /** Set to "_blank" for links that leave the page; `rel` is filled in to match. */
  target?: string;
  className?: string;
  "aria-label"?: string;
  children: ReactNode;
};

/** Register-style CTA styled like a Minecraft UI button: a flat color with an inset bevel. */
export function MinecraftButton({
  href,
  color = "#5a8f3c",
  borderColor = "#1f2e14",
  textColor,
  glint = false,
  glintDelay = 0,
  target,
  className = "",
  "aria-label": ariaLabel,
  children,
}: MinecraftButtonProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.a
      href={href}
      target={target}
      rel={target === "_blank" ? "noopener noreferrer" : undefined}
      aria-label={ariaLabel}
      className={`pointer-events-auto relative inline-flex select-none items-center justify-center gap-2 overflow-hidden uppercase tracking-[0.15em] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
        className || "px-8 py-3 text-sm md:text-base"
      }`}
      style={{
        fontFamily: PIXEL_FONT,
        color: textColor ?? "#fff",
        // A dark shadow under near-black text on a bright fill just muddies it.
        textShadow: textColor ? undefined : "2px 2px 0 rgba(0,0,0,0.5)",
        background: color,
        border: `2px solid ${borderColor}`,
        boxShadow: "inset 3px 3px 0 rgba(255,255,255,0.25), inset -3px -3px 0 rgba(0,0,0,0.35)",
        outlineColor: borderColor,
      }}
      whileHover={{ scale: 1.02, filter: "brightness(1.1)" }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.12 }}
    >
      {glint && !reduceMotion && <Glint delay={glintDelay} />}
      {children}
    </motion.a>
  );
}

/** A wood-plank style badge, used here for the event dates. */
export function PixelBadge({ children }: { children: ReactNode }) {
  return (
    <span
      className="inline-block px-4 py-1.5 text-xs md:text-sm uppercase tracking-[0.2em] select-none"
      style={{
        fontFamily: PIXEL_FONT,
        color: "#3a2a18",
        background: "#a9772f",
        border: "2px solid #2b1d10",
        boxShadow: "inset 2px 2px 0 rgba(255,255,255,0.25), inset -2px -2px 0 rgba(0,0,0,0.35)",
      }}
    >
      {children}
    </span>
  );
}

/** A small stone-block style chip, used for footer social links. */
export function PixelChip({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-block px-4 py-2 text-xs md:text-sm uppercase tracking-[0.15em] select-none transition-[filter] hover:brightness-110"
      style={{
        fontFamily: PIXEL_FONT,
        color: "#dfe3f0",
        background: "#2b2f3a",
        border: "2px solid #14161c",
        boxShadow: "inset 2px 2px 0 rgba(255,255,255,0.12), inset -2px -2px 0 rgba(0,0,0,0.4)",
      }}
    >
      {children}
    </a>
  );
}
