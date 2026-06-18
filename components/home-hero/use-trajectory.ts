"use client";

import { useTransform, type MotionValue } from "motion/react";
import { trajectory } from "./sky";

/** Derives a celestial body's screen position from its arc progress and the viewport size. */
export function useTrajectory(
  cp: MotionValue<number>,
  width: MotionValue<number>,
  height: MotionValue<number>,
) {
  const x = useTransform([cp, width, height], ([c, w, h]) =>
    trajectory(c as number, w as number, h as number).x,
  );
  const y = useTransform([cp, width, height], ([c, w, h]) =>
    trajectory(c as number, w as number, h as number).y,
  );
  return { x, y };
}
