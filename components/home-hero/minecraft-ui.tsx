"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

const PIXEL_FONT = "var(--font-minecraft), ui-monospace, 'Courier New', monospace";

type MinecraftButtonProps = { href: string; children: ReactNode };

/** Register-style CTA styled like a Minecraft UI button: a flat color with an inset bevel. */
export function MinecraftButton({ href, children }: MinecraftButtonProps) {
  return (
    <motion.a
      href={href}
      className="pointer-events-auto inline-block px-8 py-3 text-sm md:text-base uppercase tracking-[0.15em] select-none"
      style={{
        fontFamily: PIXEL_FONT,
        color: "#fff",
        textShadow: "2px 2px 0 rgba(0,0,0,0.5)",
        background: "#5a8f3c",
        border: "2px solid #1f2e14",
        boxShadow: "inset 3px 3px 0 rgba(255,255,255,0.25), inset -3px -3px 0 rgba(0,0,0,0.35)",
      }}
      whileHover={{ scale: 1.04, filter: "brightness(1.1)" }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.12 }}
    >
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
