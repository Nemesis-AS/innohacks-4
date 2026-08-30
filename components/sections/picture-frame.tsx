"use client";

import { motion } from "motion/react";
import type { KeyboardEvent, ReactNode } from "react";
import oakLogTexture from "@/assets/oak_log.png";

const FRAME_TILE = 32;
import { PIXEL_FONT } from "@/util/ui";

type PictureFrameProps = {
  caption?: string;
  delay?: number;
  children?: ReactNode;
  /** When provided, the frame becomes an accessible button that opens the event's detail book. */
  onActivate?: () => void;
  /** Accessible label for the button, e.g. "Open InnoHacks 3.0 details". Falls back to the caption. */
  ariaLabel?: string;
};

/** Minecraft-style picture frame: thick wood-textured border with a beveled, 3D inset, fading in from below as it scrolls into view. */
export function PictureFrame({ caption, delay = 0, children, onActivate, ariaLabel }: PictureFrameProps) {
  const interactive = Boolean(onActivate);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, ease: "easeOut", delay }}
      whileHover={interactive ? { y: -4 } : undefined}
      {...(interactive
        ? {
            role: "button" as const,
            tabIndex: 0,
            "aria-label": ariaLabel ?? caption,
            onClick: onActivate,
            onKeyDown: (event: KeyboardEvent) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onActivate?.();
              }
            },
          }
        : {})}
      className={`group flex flex-col gap-2 rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/80${interactive ? " cursor-pointer" : ""}`}
    >
      <div
        className="p-3"
        style={{
          backgroundImage: `url(${oakLogTexture.src})`,
          backgroundSize: `${FRAME_TILE}px ${FRAME_TILE}px`,
          backgroundRepeat: "repeat",
          imageRendering: "pixelated",
          border: "3px solid #3a2615",
          boxShadow: [
            "inset 0 0 0 3px rgba(255,255,255,0.15)",
            "inset 0 0 0 6px rgba(0,0,0,0.45)",
            "0 10px 0 rgba(0,0,0,0.3)",
            "0 14px 28px rgba(0,0,0,0.4)",
          ].join(", "),
        }}
      >
        <div
          className="flex aspect-[4/3] items-center justify-center overflow-hidden p-4 grayscale transition-[filter] duration-300 ease-out group-hover:grayscale-0"
          style={{
            backgroundColor: "#1c1c1c",
            boxShadow: "inset 0 4px 10px rgba(0,0,0,0.6), inset 0 0 0 2px rgba(0,0,0,0.5)",
          }}
        >
          {children}
        </div>
      </div>
      {caption && (
        <span
          className="text-center text-sm uppercase tracking-[0.15em] text-white md:text-base"
          style={{ fontFamily: PIXEL_FONT, textShadow: "2px 2px 0 rgba(0,0,0,0.85)" }}
        >
          {caption}
        </span>
      )}
      {interactive && (
        <span
          aria-hidden
          className="text-center text-[10px] uppercase tracking-[0.2em] text-white/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ fontFamily: PIXEL_FONT }}
        >
          ▸ Open journal
        </span>
      )}
    </motion.div>
  );
}
