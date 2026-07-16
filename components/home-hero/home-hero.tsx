"use client";

import { motion, useMotionValueEvent, useScroll, useTransform } from "motion/react";
import { useRef, useState } from "react";
import grassTexture from "@/assets/grass.png";
import dirtTexture from "@/assets/dirt.png";
import logoImg from "@/assets/innohacks-logo.png";
import moonImg from "@/assets/moon.png";
import sunImg from "@/assets/sun.png";
import { CelestialBody } from "./celestial-body";
import { EventInfo } from "./event-info";
import { GlassPanel } from "./glass-panel";
import { Ground } from "./ground";
import { SceneDecor } from "./scene-decor";
import { SkyBackdrop } from "./sky-backdrop";
import { Starfield } from "./starfield";
import { cycleNumbers, cycleProgress, SKY_BOTTOM_COLORS, SKY_STOP_POSITIONS, SKY_TOP_COLORS, withAlpha } from "./sky";
import { useTrajectory } from "./use-trajectory";
import { useViewportSize } from "./use-viewport-size";


const SUN_GLOW = "drop-shadow(0 0 24px rgba(255, 230, 120, 0.85)) drop-shadow(0 0 60px rgba(255, 200, 80, 0.55))";
const MOON_GLOW =
  "drop-shadow(0 0 22px rgba(220, 230, 255, 0.95)) drop-shadow(0 0 60px rgba(180, 200, 255, 0.7)) drop-shadow(0 0 110px rgba(150, 180, 255, 0.4))";

// Sunset starts here; past it the logo and glass panel take their night styling.
const NIGHTFALL = cycleProgress(0.5);

const NIGHT_AMOUNT = cycleNumbers([0, 0.5, 0.62, 0.95, 1], [0, 0, 1, 1, 0]);
const SUN_CP = cycleNumbers([0, 0.55], [0.08, 1.4]);
const MOON_CP = cycleNumbers([0.45, 1], [-0.4, 0.93]);
const SUN_OPACITY = cycleNumbers([0, 0.52, 0.6], [1, 1, 0]);
const MOON_OPACITY = cycleNumbers([0.4, 0.5, 0.97, 1], [0, 1, 1, 0]);

/** Scroll-driven Minecraft-style day/night cycle hero, with a sun and moon arcing across the sky. */
export function HomeHero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: progress } = useScroll({ target: heroRef, offset: ["start start", "end end"] });
  const { width, height } = useViewportSize();
  const [isDay, setIsDay] = useState(true);

  useMotionValueEvent(progress, "change", (value) => {
    const next = value < NIGHTFALL;
    setIsDay((current) => (current === next ? current : next));
  });

  const skyTop = useTransform(progress, SKY_STOP_POSITIONS, SKY_TOP_COLORS);
  const skyBottom = useTransform(progress, SKY_STOP_POSITIONS, SKY_BOTTOM_COLORS);
  const background = useTransform(
    [skyTop, skyBottom],
    ([top, bottom]) => `linear-gradient(to bottom, ${top} 0%, ${bottom} 100%)`,
  );
  const fog = useTransform(
    skyBottom,
    (bottom) => `linear-gradient(to bottom, transparent 0%, ${withAlpha(bottom, 0.85)} 55%, ${bottom} 100%)`,
  );

  const nightAmount = useTransform(progress, ...NIGHT_AMOUNT);

  const sunCp = useTransform(progress, ...SUN_CP);
  const moonCp = useTransform(progress, ...MOON_CP);
  const sunOpacity = useTransform(progress, ...SUN_OPACITY);
  const moonOpacity = useTransform(progress, ...MOON_OPACITY);
  const size = useTransform([width, height], ([w, h]) => Math.round(Math.min(w as number, h as number) * 0.13));

  const sunPos = useTrajectory(sunCp, width, height);
  const moonPos = useTrajectory(moonCp, width, height);

  return (
    <>
      {/* Scroll spacer — local scroll distance the day/night cycle plays out over */}
      <main id="hero" ref={heroRef} className="relative" style={{ height: "280vh" }}>
        <div className="sticky top-0 h-screen overflow-hidden">
          <SkyBackdrop background={background} fog={fog} />
          <Starfield width={width} height={height} opacity={nightAmount} />
          <CelestialBody src={sunImg} alt="Sun" size={size} x={sunPos.x} y={sunPos.y} opacity={sunOpacity} glow={SUN_GLOW} />
          <CelestialBody src={moonImg} alt="Moon" size={size} x={moonPos.x} y={moonPos.y} opacity={moonOpacity} glow={MOON_GLOW} />

          {/* Ground layer — fixed to the bottom of the viewport for the whole hero scroll */}
          <Ground id="home-hero-ground" grass={grassTexture} dirt={dirtTexture} />

          <SceneDecor />

          <section className="relative z-10 flex h-full flex-col items-center justify-center pointer-events-none px-6">
            <motion.img
              src={logoImg.src}
              alt="InnoHacks 4.0"
              className="w-[min(56vw,520px)] h-auto select-none"
              style={{
                imageRendering: "pixelated",
                filter: isDay
                  ? "drop-shadow(0 8px 0 rgba(0,0,0,0.25)) drop-shadow(0 0 30px rgba(255,235,160,0.35))"
                  : "drop-shadow(0 8px 0 rgba(0,0,0,0.45)) drop-shadow(0 0 40px rgba(160,180,255,0.45))",
              }}
            />
            <div className="mt-6">
              <GlassPanel isDay={isDay}>
                <EventInfo />
              </GlassPanel>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
