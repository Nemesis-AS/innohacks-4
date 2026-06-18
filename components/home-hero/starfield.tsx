"use client";

import { motion, useAnimationFrame, useMotionValueEvent, type MotionValue } from "motion/react";
import { useMemo, useRef } from "react";
import { generateStars, type Star } from "./sky";

const STAR_COUNT = 220;

type StarfieldProps = {
  width: MotionValue<number>;
  height: MotionValue<number>;
  opacity: MotionValue<number>;
};

/** Twinkling starfield, faded in via `opacity` as night falls. */
export function Starfield({ width, height, opacity }: StarfieldProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stars = useMemo<Star[]>(() => generateStars(STAR_COUNT), []);

  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const w = width.get();
    const h = height.get();
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.getContext("2d")?.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  useMotionValueEvent(width, "change", resizeCanvas);
  useMotionValueEvent(height, "change", resizeCanvas);

  useAnimationFrame((elapsed) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    if (canvas.width === 0) resizeCanvas();

    const w = width.get();
    const h = height.get();
    const nightAmount = opacity.get();
    const t = elapsed / 1000;

    ctx.clearRect(0, 0, w, h);
    if (nightAmount <= 0.01) return;

    for (const star of stars) {
      const twinkle = 0.55 + 0.45 * Math.sin(t * star.twinkleSpeed + star.phase);
      ctx.fillStyle = `rgba(255, 255, 255, ${(nightAmount * twinkle).toFixed(3)})`;
      ctx.fillRect(star.x * w, star.y * h, star.size, star.size);
    }
  });

  return (
    <motion.canvas
      ref={canvasRef}
      className="absolute inset-0 -z-10 pointer-events-none"
      style={{ width, height, opacity }}
    />
  );
}
