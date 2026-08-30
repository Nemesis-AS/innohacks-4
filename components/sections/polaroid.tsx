"use client";

import { motion, useReducedMotion } from "motion/react";
import Image, { type StaticImageData } from "next/image";

import { DUR_REVEAL, EASE } from "@/util/motion";
import { FOCUS_RING_INK } from "@/util/ui";

/**
 * Fixed rotations rather than `Math.random()`: a random tilt would differ between
 * the server and client renders, and would reshuffle every photo on each re-render.
 */
const TILTS = [-4.5, 3, -2, 4, -3.5, 2.5, -5, 3.5];

/** The photo paper, its edge, and the shadow it casts on the parchment. */
const PAPER = "#f6f1e4";
const PAPER_EDGE = "rgba(58,42,23,0.35)";
const PAPER_SHADOW = "0 2px 0 rgba(0,0,0,0.18), 0 6px 14px rgba(0,0,0,0.3)";

/** The photo-paper surface itself, shared by the scrapbook tiles and the enlarged view. */
export const POLAROID_PAPER = {
  backgroundColor: PAPER,
  border: `2px solid ${PAPER_EDGE}`,
  boxShadow: PAPER_SHADOW,
} as const;

/**
 * Washi tape in hard 4px stops rather than a smooth gradient, so even the
 * fastener stays inside the site's pixel language.
 */
const TAPE_BG =
  "repeating-linear-gradient(90deg, rgba(233,215,166,0.62) 0 4px, rgba(222,201,150,0.62) 4px 8px)";
const TAPE_SHADOW = "inset 0 0 0 1px rgba(120,95,50,0.28), 0 1px 2px rgba(0,0,0,0.2)";

type PolaroidProps = {
  src: string | StaticImageData;
  /** Describes the photo; also labels the button, since the image itself is decorative inside it. */
  alt: string;
  /** Position in the gallery — picks the tilt and staggers the entrance. */
  index: number;
  onClick: () => void;
};

/**
 * One photo printed on polaroid stock and taped to the page at an angle. Clicking
 * it opens the enlarged view — at scrapbook size the faces aren't readable, so the
 * tile is a thumbnail that happens to look like the real thing.
 */
export function Polaroid({ src, alt, index, onClick }: PolaroidProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const tilt = TILTS[index % TILTS.length];
  // Tape holds down the corner the tilt lifts, so it reads as physically plausible.
  const tapeOnLeft = tilt > 0;

  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={alt}
      // Raised on hover/focus so the lifted photo clears the ones it overlaps.
      // `block w-full` because a button shrinks to fit, and the photo inside is an
      // absolutely-positioned `fill` image with no intrinsic width to shrink to.
      className={`relative z-0 block w-full cursor-pointer hover:z-10 focus-visible:z-10 ${FOCUS_RING_INK}`}
      initial={reduceMotion ? { opacity: 0, rotate: tilt } : { opacity: 0, y: 12, rotate: tilt }}
      animate={{ opacity: 1, y: 0, rotate: tilt }}
      // Capped so a long gallery's last photos don't crawl in half a second late.
      transition={{
        duration: reduceMotion ? 0 : DUR_REVEAL,
        ease: EASE,
        delay: reduceMotion ? 0 : Math.min(index, 6) * 0.05,
      }}
      // Straightens as it lifts, as if picked up off the page.
      whileHover={reduceMotion ? undefined : { rotate: 0, scale: 1.05, y: -4 }}
      whileTap={reduceMotion ? undefined : { scale: 1.02 }}
    >
      <div
        className="p-1.5 pb-6"
        style={POLAROID_PAPER}
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-[#1c1c1c]">
          {/* Event photos aren't pixel art, so these render smoothly rather than pixelated. */}
          <Image
            src={src}
            alt=""
            fill
            sizes="(min-width: 768px) 11rem, 42vw"
            className="object-cover"
          />
        </div>
      </div>

      {/* Half on the photo, half on the parchment. */}
      <span
        aria-hidden
        className={`absolute -top-2 h-4 w-14 ${tapeOnLeft ? "-left-3" : "-right-3"}`}
        style={{
          background: TAPE_BG,
          boxShadow: TAPE_SHADOW,
          transform: `rotate(${tapeOnLeft ? -38 : 38}deg)`,
        }}
      />
    </motion.button>
  );
}
