"use client";

import { motion, type MotionValue } from "motion/react";
import type { StaticImageData } from "next/image";

type CelestialBodyProps = {
  src: StaticImageData;
  alt: string;
  size: MotionValue<number>;
  x: MotionValue<number>;
  y: MotionValue<number>;
  opacity: MotionValue<number>;
  glow: string;
};

/** A sun/moon image positioned along its scroll-driven arc. */
export function CelestialBody({ src, alt, size, x, y, opacity, glow }: CelestialBodyProps) {
  return (
    <motion.img
      src={src.src}
      alt={alt}
      className="absolute pointer-events-none select-none"
      style={{
        left: x,
        top: y,
        width: size,
        height: size,
        translateX: "-50%",
        translateY: "-50%",
        opacity,
        imageRendering: "pixelated",
        filter: glow,
      }}
    />
  );
}
