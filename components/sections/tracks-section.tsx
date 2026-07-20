"use client";

import { motion, useAnimationControls, useReducedMotion } from "motion/react";
import type { StaticImageData } from "next/image";
import coalStoneTexture from "@/assets/coal_stone.png";
import copperStoneTexture from "@/assets/copper_stone.png";
import diamondDeepslateTexture from "@/assets/diamond_deepslate.png";
import goldNetherTexture from "@/assets/gold_nether.png";
import grassTexture from "@/assets/grass.png";
import ironStoneTexture from "@/assets/iron_stone.png";
import oakLogTexture from "@/assets/oak_log.png";
import oakSignTexture from "@/assets/oak_sign.png";
import stoneTexture from "@/assets/stone.png";
import { BlockSection } from "./block-section";

const PIXEL_FONT =
  "var(--font-minecraft), ui-monospace, 'Courier New', monospace";

/**
 * Burnt-in sign text. Near-black rather than brown, and with no highlight on
 * body copy — a one-pixel light shadow legible on a heading just fills in the
 * counters at 12px and turns the paragraph to mush.
 */
const CARVED_TEXT = "#241608";
const HEADING_SHADOW = "1px 1px 0 rgba(255,255,255,0.22)";

/**
 * The oak grain is high-frequency noise directly behind small text, so it is
 * washed out with a flat sanded tone and left showing through at ~35% — enough
 * to still read as wood, calm enough to set type on.
 */
const SANDED_OAK = "rgba(233,207,157,0.65)";

type Track = {
  icon: StaticImageData;
  iconAlt: string;
  name: string;
  color: string;
  description: string;
};

const TRACKS: Track[] = [
  {
    icon: copperStoneTexture,
    iconAlt: "Copper ore",
    name: "IoT",
    color: "#b5651d",
    description:
      "Wire up sensors, boards, and signals. Build something that reaches out of the screen and into the real world.",
  },
  {
    icon: diamondDeepslateTexture,
    iconAlt: "Deepslate diamond ore",
    name: "Agentic AI/GenAI",
    color: "#4c3a8c",
    description:
      "Agents that plan, tools they can call, models that generate. Ship AI that actually does the work, not just chats about it.",
  },
  {
    icon: goldNetherTexture,
    iconAlt: "Nether gold ore",
    name: "Blockchain/Web3",
    color: "#caa23a",
    description:
      "Smart contracts, dApps, and on-chain tooling. Build for a world with no admin — trust lives in the code.",
  },
  {
    icon: grassTexture,
    iconAlt: "Grass block",
    name: "Open Innovation",
    color: "#4a7c4e",
    description:
      "No rails, no rules. If it solves a real problem and you can demo it in 24 hours, it belongs here.",
  },
];

/**
 * Oak beam the signs hang from. Bleeds half the column gap past each edge so a
 * row of signs reads as hanging off one continuous beam.
 */
function Beam() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute -left-3 -right-3 top-0 h-3"
      style={{
        backgroundImage: `url(${oakLogTexture.src})`,
        backgroundSize: "16px 16px",
        imageRendering: "pixelated",
        boxShadow:
          "inset 0 2px 0 rgba(255,255,255,0.16), inset 0 -2px 0 rgba(0,0,0,0.4)",
      }}
    />
  );
}

/** Iron chain link running from the beam down to the board. */
function Chain() {
  return (
    <div
      aria-hidden
      className="h-5 w-[6px]"
      style={{
        backgroundColor: "#6e6e6e",
        borderLeft: "2px solid #8f8f8f",
        borderRight: "2px solid #2e2e2e",
        boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.45)",
      }}
    />
  );
}

/**
 * One track on a hanging oak sign.
 *
 * Board and chains rotate as a single unit about the beam, so the chains stay
 * attached while it swings — the whole assembly below the beam is the pendulum.
 * The swing is a damped keyframe set rather than a spring: a spring on rotate
 * settles symmetrically, which reads as a wobble instead of a hanging weight.
 *
 * Both swings run through one set of controls rather than whileInView/whileHover,
 * because a gesture prop cannot interrupt an entry animation still in flight —
 * pointing at a sign mid-swing would do nothing until it had settled. Each
 * keyframe set opens with `null`, meaning "start from wherever it is now", so a
 * nudge picks the sign up at its current angle instead of snapping to level.
 */
function TrackSign({
  track,
  delay,
  reduceMotion,
}: {
  track: Track;
  delay: number;
  reduceMotion: boolean;
}) {
  const controls = useAnimationControls();

  const settle = () => {
    if (reduceMotion) {
      controls.start({ opacity: 1, transition: { duration: 0.3, delay } });
      return;
    }
    controls.start({
      opacity: 1,
      rotate: [null, -7, 5, -3, 1.5, -0.5, 0],
      transition: { duration: 1.6, ease: "easeOut", delay },
    });
  };

  // Shallower arc and quicker damping than the entry swing: a nudge, not a shove.
  // Opacity rides along in case the entry animation was cut short by this.
  const nudge = () => {
    if (reduceMotion) return;
    controls.start({
      opacity: 1,
      rotate: [null, -3.5, 2.2, -1, 0],
      transition: { duration: 1.1, ease: "easeOut" },
    });
  };

  return (
    <div className="relative pt-3">
      <Beam />
      <motion.div
        className="flex h-full flex-col items-center"
        style={{ transformOrigin: "top center" }}
        initial={{ opacity: 0, rotate: 0 }}
        animate={controls}
        viewport={{ once: true, amount: 0.3 }}
        onViewportEnter={settle}
        onHoverStart={nudge}
        // Touch has no hover, so a tap is the nudge there.
        onTapStart={nudge}
      >
        <div className="flex w-1/2 justify-between">
          <Chain />
          <Chain />
        </div>

        {/* The board: oak planks, chiselled edge, text burned in. */}
        <div
          className="flex w-full flex-1 flex-col gap-2 p-4"
          style={{
            backgroundImage: `linear-gradient(${SANDED_OAK}, ${SANDED_OAK}), url(${oakSignTexture.src})`,
            backgroundSize: "auto, 48px 48px",
            imageRendering: "pixelated",
            border: "3px solid #4b3418",
            boxShadow:
              "inset 0 3px 0 rgba(255,255,255,0.18), inset 0 -3px 0 rgba(0,0,0,0.28), 0 10px 24px rgba(0,0,0,0.45)",
          }}
        >
          <div className="flex items-center gap-2">
            <img
              src={track.icon.src}
              alt={track.iconAlt}
              className="h-6 w-6 shrink-0"
              style={{ imageRendering: "pixelated" }}
            />
            <h3
              className="text-base uppercase md:text-lg"
              style={{
                color: CARVED_TEXT,
                fontFamily: PIXEL_FONT,
                textShadow: HEADING_SHADOW,
              }}
            >
              {track.name}
            </h3>
          </div>

          {/* Branded rule, so the track colour survives the all-oak palette. */}
          <div
            aria-hidden
            className="h-[2px] w-full"
            style={{ backgroundColor: track.color, opacity: 0.75 }}
          />

          <p
            className="text-sm leading-relaxed md:text-base"
            style={{
              color: CARVED_TEXT,
              fontFamily: PIXEL_FONT,
            }}
          >
            {track.description}
          </p>
        </div>
      </motion.div>
    </div>
  );
}

/** The four hackathon tracks, each on an oak sign hanging from a shared beam. */
export function TracksSection() {
  const reduceMotion = useReducedMotion() ?? false;

  return (
    <BlockSection
      id="tracks"
      title="Tracks"
      texture={stoneTexture}
      fallbackColor="#8a8a8a"
      oreTextures={[coalStoneTexture, copperStoneTexture, ironStoneTexture]}
      seam={false}
      align="left"
      maxWidthClassName="max-w-4xl"
    >
      <div className="grid w-full grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2">
        {TRACKS.map((track, index) => (
          <TrackSign
            key={track.name}
            track={track}
            delay={index * 0.12}
            reduceMotion={reduceMotion}
          />
        ))}
      </div>
    </BlockSection>
  );
}
