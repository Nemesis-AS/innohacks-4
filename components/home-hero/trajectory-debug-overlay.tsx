"use client";

import { type MotionValue } from "motion/react";
import { useEffect, useState } from "react";
import { trajectory } from "./sky";

type TrajectoryDebugOverlayProps = {
  width: MotionValue<number>;
  height: MotionValue<number>;
  steps?: number;
};

/**
 * Dev-only overlay that traces the full 0..1 celestial arc so you can tune
 * `trajectory()` in sky.ts visually. Drop into HomeHero's render while
 * tweaking, then remove — not meant to ship.
 */
export function TrajectoryDebugOverlay({ width, height, steps = 64 }: TrajectoryDebugOverlayProps) {
  const [path, setPath] = useState("");

  useEffect(() => {
    const redraw = () => {
      const w = width.get();
      const h = height.get();
      const points = Array.from({ length: steps + 1 }, (_, i) => trajectory(i / steps, w, h));
      setPath(points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" "));
    };
    redraw();
    const unsubWidth = width.on("change", redraw);
    const unsubHeight = height.on("change", redraw);
    return () => {
      unsubWidth();
      unsubHeight();
    };
  }, [width, height, steps]);

  return (
    <svg className="fixed inset-0 z-50 pointer-events-none" width="100%" height="100%">
      <path d={path} fill="none" stroke="#ff00ff" strokeWidth={2} strokeDasharray="6 6" />
    </svg>
  );
}
