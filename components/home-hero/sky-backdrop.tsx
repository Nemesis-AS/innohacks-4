"use client";

import { motion, type MotionValue } from "motion/react";

type SkyBackdropProps = {
  background: MotionValue<string>;
  fog: MotionValue<string>;
};

/** Fixed sky gradient plus a horizon haze that fades into the gradient's base color. */
export function SkyBackdrop({ background, fog }: SkyBackdropProps) {
  return (
    <>
      <motion.div className="absolute inset-0 -z-10" style={{ background }} />
      <motion.div
        className="absolute inset-x-0 bottom-0 -z-10 pointer-events-none"
        style={{ height: "55%", background: fog }}
      />
    </>
  );
}
