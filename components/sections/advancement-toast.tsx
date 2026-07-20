"use client";

import { motion, useReducedMotion } from "motion/react";
import type { StaticImageData } from "next/image";
import toastsTexture from "@/assets/toasts.png";

const PIXEL_FONT = "var(--font-minecraft), ui-monospace, 'Courier New', monospace";

/**
 * Geometry of the advancement toast within assets/toasts.png: a 160x32 sprite at the
 * sheet's top-left corner. Everything below is expressed as a percentage of the sprite
 * so the toast scales fluidly instead of locking to an integer zoom.
 */
const SHEET = 256;
const SPRITE_W = 160;
const SPRITE_H = 32;

/** Vanilla lays the icon at x=8,y=8 (16x16) and the text column at x=30. */
const ICON_LEFT = `${(8 / SPRITE_W) * 100}%`;
const ICON_TOP = `${(8 / SPRITE_H) * 100}%`;
const ICON_SIZE_W = `${(16 / SPRITE_W) * 100}%`;
const ICON_SIZE_H = `${(16 / SPRITE_H) * 100}%`;
const TEXT_LEFT = `${(30 / SPRITE_W) * 100}%`;

type AdvancementToastProps = {
  /** Yellow header line — "Advancement Made!", "Goal Reached!", etc. */
  title?: string;
  /** The advancement's name, in white beneath the title. */
  name: string;
  icon: StaticImageData;
  iconAlt?: string;
  /** Seconds to hold before sliding in, for staggering a row of toasts. */
  delay?: number;
  /** Cap on the rendered width, in px. */
  maxWidth?: number;
};

/** Minecraft advancement toast, drawn from the real toasts.png sprite. Slides in like the in-game popup. */
export function AdvancementToast({
  title = "Advancement Made!",
  name,
  icon,
  iconAlt = "",
  delay = 0,
  maxWidth = 420,
}: AdvancementToastProps) {
  const reduceMotion = useReducedMotion() ?? false;

  return (
    <motion.div
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, x: 48 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.6 }}
      transition={{ duration: 0.45, ease: "easeOut", delay }}
      className="relative w-full select-none"
      style={{
        maxWidth,
        aspectRatio: `${SPRITE_W} / ${SPRITE_H}`,
        backgroundImage: `url(${toastsTexture.src})`,
        // Scale the whole sheet so its 160px-wide sprite exactly fills this element.
        backgroundSize: `${(SHEET / SPRITE_W) * 100}% auto`,
        backgroundPosition: "0 0",
        backgroundRepeat: "no-repeat",
        imageRendering: "pixelated",
      }}
    >
      <img
        src={icon.src}
        alt={iconAlt}
        className="absolute object-contain"
        style={{
          left: ICON_LEFT,
          top: ICON_TOP,
          width: ICON_SIZE_W,
          height: ICON_SIZE_H,
          imageRendering: "pixelated",
        }}
      />
      <div
        className="absolute flex flex-col justify-center gap-[0.35em]"
        style={{ left: TEXT_LEFT, top: 0, bottom: 0, right: "4%" }}
      >
        <span
          className="text-[10px] leading-none md:text-xs"
          style={{ color: "#ffff00", fontFamily: PIXEL_FONT }}
        >
          {title}
        </span>
        <span
          className="text-[10px] leading-none text-white md:text-xs"
          style={{ fontFamily: PIXEL_FONT }}
        >
          {name}
        </span>
      </div>
    </motion.div>
  );
}
