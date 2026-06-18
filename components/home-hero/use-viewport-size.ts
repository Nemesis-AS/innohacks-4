"use client";

import { useMotionValue, type MotionValue } from "motion/react";
import { useEffect } from "react";

const DEFAULT_WIDTH = 1280;
const DEFAULT_HEIGHT = 800;

/**
 * Tracks viewport dimensions as motion values so scroll-linked transforms
 * (celestial trajectory, body size) stay reactive on resize without
 * forcing a React re-render of the whole tree.
 */
export function useViewportSize(): { width: MotionValue<number>; height: MotionValue<number> } {
  const width = useMotionValue(DEFAULT_WIDTH);
  const height = useMotionValue(DEFAULT_HEIGHT);

  useEffect(() => {
    const updateSize = () => {
      width.set(window.innerWidth);
      height.set(window.innerHeight);
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, [width, height]);

  return { width, height };
}
