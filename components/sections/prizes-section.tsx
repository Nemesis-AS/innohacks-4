"use client";

import { motion, useReducedMotion } from "motion/react";
import oakLogTexture from "@/assets/oak_log.png";
import treasureMapImg from "@/assets/map/treasure_map.png";
import sculkCatalystTexture from "@/assets/sculk_catalyst_top.png";
import sculkStillTexture from "@/assets/sculk_still.png";
import sculkVeinStillTexture from "@/assets/sculk_vein_still.png";
import { BlockSection } from "./block-section";

import { VIEWPORT, VIEWPORT_TALL } from "@/util/motion";
import { PIXEL_FONT } from "@/util/ui";

/** Brightest colour in the sculk palette — what the floor glows with. */
const SCULK_GLINT = "41, 223, 235";

/**
 * Faded ink, written straight onto the parchment. Dark enough to read on the
 * paper tone, warm enough that it looks like it was inked a long time ago rather
 * than typed on top — helped by a highlight below it, which is what makes the
 * letters sit *in* the sheet instead of floating over it.
 */
const AGED_INK = "#6b4a26";
const AGED_EMBOSS = "1px 1px 0 rgba(255,255,255,0.35)";

/** Seconds the map takes to open. */
const UNFURL = 0.7;

/*
 * ---------------------------------------------------------------------------
 * PARKED UNTIL THE PRIZE POOL IS CONFIRMED
 * ---------------------------------------------------------------------------
 * The map is built to carry seven markers — 1st/2nd/3rd plus one per track —
 * each with a white dialog bubble out in the gutter and a dashed leader running
 * back to its X. All of that is written and working; it is commented out only
 * because the amounts are not public yet, and a board of "₹XX,XXX" placeholders
 * reads worse than not showing one. Uncomment this block, the two call sites
 * marked below, and the `redXImg` / `TRACKS` imports to bring it back.
 *
 * The podium `x`/`y` values are kept in step by hand with `TRAIL` in
 * `scripts/generate-prize-art.mjs`: the dashed trail baked into the map art is
 * drawn between those three points, so it only lands correctly if the two agree.
 *
 * import redXImg from "@/assets/map/red_x.png";
 * import type { CSSProperties } from "react";
 * import { TRACKS } from "./tracks-section";
 *
 * // The plate is a percentage grid: the map sits in the middle, bubbles in the
 * // gutters either side. Every coordinate is a percentage of the plate, which is
 * // what lets the leader lines be plain arithmetic instead of measured layout.
 * const MAP_LEFT = 27;
 * const MAP_WIDTH = 46;
 * const GUTTER = 26;
 * const STAGGER = 0.08;
 * // The map's own paper tone, sampled from `assets/map/map_background.png`.
 * const PAPER = "#d6be96";
 * // Bubble chrome: white body on a near-black outline — the one bright surface
 * // in a section that is otherwise all sculk.
 * const BUBBLE_BG = "#ffffff";
 * const BUBBLE_LINE = "#1a1a1a";
 * const BUBBLE_TEXT = "#2b2b2b";
 *
 * type Prize = {
 *   id: string;
 *   label: string;
 *   amount: string;
 *   detail: string;
 *   // Accent rule on the bubble, and the marker's glow.
 *   color: string;
 *   // Marker size in px. A multiple of 8, so the 8px source scales without blurring.
 *   size: number;
 *   // Marker position, as a percentage of the map.
 *   x: number;
 *   y: number;
 *   // Which gutter the bubble sits in, and where its tail meets it (plate %).
 *   side: "left" | "right";
 *   bubbleY: number;
 *   // Ties a bubble to its marker on narrow screens, where there are no leaders.
 *   pip: string;
 * };
 *
 * const PODIUM: Prize[] = [
 *   { id: "first",  label: "1st Place", amount: "₹XX,XXX", detail: "Cash prize, swag & sponsor perks",
 *     color: "#fcdc5f", size: 32, x: 52, y: 34, side: "left", bubbleY: 20, pip: "1" },
 *   { id: "second", label: "2nd Place", amount: "₹XX,XXX", detail: "Cash prize, swag & sponsor perks",
 *     color: "#dcdcdc", size: 24, x: 30, y: 66, side: "left", bubbleY: 50, pip: "2" },
 *   { id: "third",  label: "3rd Place", amount: "₹XX,XXX", detail: "Cash prize, swag & sponsor perks",
 *     color: "#c87137", size: 24, x: 73, y: 60, side: "left", bubbleY: 80, pip: "3" },
 * ];
 *
 * // Where each track's prize is buried, in the order `TRACKS` declares them.
 * const TRACK_SPOTS = [
 *   { x: 39, y: 24, bubbleY: 14 },
 *   { x: 68, y: 44, bubbleY: 38 },
 *   { x: 46, y: 72, bubbleY: 62 },
 *   { x: 29, y: 48, bubbleY: 86 },
 * ];
 *
 * // One prize per track, taking its name and colour straight from the tracks
 * // section so the two can never drift apart.
 * const TRACK_PRIZES: Prize[] = TRACKS.map((track, index) => ({
 *   id: `track-${index}`,
 *   label: track.name,
 *   amount: "₹X,XXX",
 *   detail: "Best hack in track",
 *   color: track.color,
 *   size: 24,
 *   side: "right" as const,
 *   pip: `T${index + 1}`,
 *   ...TRACK_SPOTS[index],
 * }));
 *
 * const PRIZES = [...PODIUM, ...TRACK_PRIZES];
 *
 * // Marker centre in plate coordinates, which is what the leader lines aim at.
 * const markerAt = (prize: Prize) => ({
 *   x: MAP_LEFT + (prize.x / 100) * MAP_WIDTH,
 *   y: prize.y,
 * });
 *
 * // The bubble's pixel tail: three squares stepping outward, each shorter than
 * // the last. A single rotated square would be the only soft diagonal on a page
 * // of hard pixels, so the taper is built out of axis-aligned blocks instead.
 * // The first step overhangs the bubble's own border by 2px and paints over it,
 * // so the outline reads as one continuous shape rather than a box with a lump.
 * const TAIL_STEPS = [14, 9, 4];
 *
 * function Tail({ side }: { side: "left" | "right" }) {
 *   // A bubble in the left gutter points right, at the map.
 *   const pointsRight = side === "left";
 *
 *   return (
 *     <span
 *       aria-hidden
 *       className="absolute top-1/2 hidden -translate-y-1/2 items-center lg:flex"
 *       style={{
 *         [pointsRight ? "left" : "right"]: "100%",
 *         [pointsRight ? "marginLeft" : "marginRight"]: -2,
 *         flexDirection: pointsRight ? "row" : "row-reverse",
 *       }}
 *     >
 *       {TAIL_STEPS.map((height, index) => (
 *         <span
 *           key={index}
 *           style={{
 *             width: 4,
 *             height,
 *             backgroundColor: BUBBLE_BG,
 *             borderTop: `2px solid ${BUBBLE_LINE}`,
 *             borderBottom: `2px solid ${BUBBLE_LINE}`,
 *           }}
 *         />
 *       ))}
 *     </span>
 *   );
 * }
 *
 * // The pip that ties a bubble to its marker where there is no leader to do it.
 * function Pip({ prize }: { prize: Prize }) {
 *   return (
 *     <span
 *       className="inline-flex h-5 shrink-0 items-center justify-center px-1.5 text-[10px] lg:hidden"
 *       style={{
 *         fontFamily: PIXEL_FONT,
 *         color: "#12181c",
 *         backgroundColor: prize.color,
 *         border: `2px solid ${BUBBLE_LINE}`,
 *       }}
 *     >
 *       {prize.pip}
 *     </span>
 *   );
 * }
 *
 * // One prize, on a white pixel panel.
 * //
 * // Below `lg` these are laid out in a plain grid under the map; from `lg` up
 * // each one goes absolute into its gutter, hung off the `--y` set per bubble.
 * // Positioning with a custom property rather than two DOM copies keeps a single,
 * // readable copy of the text for assistive tech at every width.
 * function Bubble({ prize, delay, reduceMotion }: { prize: Prize; delay: number; reduceMotion: boolean }) {
 *   return (
 *     <motion.div
 *       className={`relative lg:absolute lg:w-[26%] lg:-translate-y-1/2 lg:top-[var(--y)] ${
 *         prize.side === "left" ? "lg:left-0" : "lg:right-0"
 *       }`}
 *       style={{ "--y": `${prize.bubbleY}%` } as CSSProperties}
 *       initial={{ opacity: 0, y: 8 }}
 *       whileInView={{ opacity: 1, y: 0 }}
 *       viewport={{ once: true, amount: 0.3 }}
 *       transition={{ duration: 0.3, ease: "easeOut", delay: reduceMotion ? 0 : delay }}
 *     >
 *       <div
 *         className="px-3 py-2"
 *         style={{
 *           backgroundColor: BUBBLE_BG,
 *           border: `2px solid ${BUBBLE_LINE}`,
 *           borderTop: `3px solid ${prize.color}`,
 *           boxShadow: `inset -2px -2px 0 rgba(0,0,0,0.18), 0 6px 0 rgba(0,0,0,0.35)`,
 *           fontFamily: PIXEL_FONT,
 *           color: BUBBLE_TEXT,
 *         }}
 *       >
 *         <div className="flex items-center gap-2">
 *           <Pip prize={prize} />
 *           <span className="text-[11px] uppercase tracking-[0.12em]">{prize.label}</span>
 *         </div>
 *         <div className="mt-1 text-lg leading-none">{prize.amount}</div>
 *         <div className="mt-1.5 text-[10px] leading-snug opacity-70">{prize.detail}</div>
 *       </div>
 *       <Tail side={prize.side} />
 *     </motion.div>
 *   );
 * }
 *
 * // One buried X. `red_x.png` is 8px square, so every size is a whole multiple of it.
 * function Marker({ prize, delay, reduceMotion }: { prize: Prize; delay: number; reduceMotion: boolean }) {
 *   return (
 *     <motion.div
 *       className="absolute -translate-x-1/2 -translate-y-1/2"
 *       style={{ left: `${prize.x}%`, top: `${prize.y}%` }}
 *       initial={{ scale: 0, opacity: 0 }}
 *       whileInView={{ scale: 1, opacity: 1 }}
 *       viewport={{ once: true, amount: 0.3 }}
 *       transition={
 *         reduceMotion ? { duration: 0.3 } : { type: "spring", stiffness: 380, damping: 16, delay }
 *       }
 *     >
 *       <motion.img
 *         src={redXImg.src}
 *         alt=""
 *         aria-hidden
 *         style={{
 *           width: prize.size,
 *           height: prize.size,
 *           imageRendering: "pixelated",
 *           filter: `drop-shadow(0 0 6px ${prize.color})`,
 *         }}
 *         animate={{ scale: reduceMotion ? 1 : [1, 1.12, 1] }}
 *         transition={{ duration: 2.4, ease: "easeInOut", repeat: Infinity, delay }}
 *       />
 *       <span
 *         aria-hidden
 *         className="absolute left-1/2 top-full mt-0.5 inline-flex h-4 -translate-x-1/2 items-center justify-center px-1 text-[9px] lg:hidden"
 *         style={{
 *           fontFamily: PIXEL_FONT,
 *           color: "#12181c",
 *           backgroundColor: prize.color,
 *           border: `2px solid ${BUBBLE_LINE}`,
 *         }}
 *       >
 *         {prize.pip}
 *       </span>
 *     </motion.div>
 *   );
 * }
 *
 * // A dashed leader from each bubble's tail to its X.
 * //
 * // The viewBox is a flat 0-100 square stretched over the plate, so a point can
 * // be dropped in with the same percentages the elements are positioned by — no
 * // measuring, and it stays right at every width. `non-scaling-stroke` is what
 * // stops the non-uniform stretch from squashing the line's own thickness.
 * function LeaderLines({ reduceMotion }: { reduceMotion: boolean }) {
 *   return (
 *     <svg
 *       aria-hidden
 *       className="pointer-events-none absolute inset-0 hidden h-full w-full lg:block"
 *       viewBox="0 0 100 100"
 *       preserveAspectRatio="none"
 *     >
 *       {PRIZES.map((prize, index) => {
 *         const marker = markerAt(prize);
 *         const fromX = prize.side === "left" ? GUTTER : 100 - GUTTER;
 *         // A short horizontal stub off the tail before the run to the marker, so
 *         // the line leaves the bubble square-on rather than at an angle.
 *         const stubX = prize.side === "left" ? fromX + 2 : fromX - 2;
 *
 *         return (
 *           <motion.polyline
 *             key={prize.id}
 *             points={`${fromX},${prize.bubbleY} ${stubX},${prize.bubbleY} ${marker.x},${marker.y}`}
 *             fill="none"
 *             stroke={PAPER}
 *             strokeWidth={2}
 *             strokeDasharray="5 5"
 *             vectorEffect="non-scaling-stroke"
 *             initial={{ pathLength: 0, opacity: 0 }}
 *             whileInView={{ pathLength: 1, opacity: 0.5 }}
 *             viewport={{ once: true, amount: 0.3 }}
 *             transition={{
 *               duration: reduceMotion ? 0.3 : 0.45,
 *               ease: "easeOut",
 *               delay: reduceMotion ? 0 : UNFURL + index * STAGGER,
 *             }}
 *           />
 *         );
 *       })}
 *     </svg>
 *   );
 * }
 */

/**
 * One of the two oak rods the map is rolled around.
 *
 * They roll out sideways rather than travelling vertically: `scaleX` is a
 * transform, so it composites on its own layer, where animating `top` would put
 * a layout pass in the middle of the unfurl.
 */
function Rod({ edge, reduceMotion }: { edge: "top" | "bottom"; reduceMotion: boolean }) {
  return (
    <motion.div
      aria-hidden
      className={`absolute -left-2 -right-2 h-3 ${edge === "top" ? "top-0" : "bottom-0"}`}
      style={{
        backgroundImage: `url(${oakLogTexture.src})`,
        backgroundSize: "16px 16px",
        imageRendering: "pixelated",
        boxShadow: "inset 0 2px 0 rgba(255,255,255,0.16), inset 0 -2px 0 rgba(0,0,0,0.45)",
      }}
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={VIEWPORT}
      transition={{ duration: reduceMotion ? 0 : UNFURL, ease: "easeOut" }}
    />
  );
}

/**
 * Prizes, as a treasure map staked out on the floor of a sculk-grown cavern.
 *
 * The map unfurls once as it scrolls into view, then the plaque settles onto it.
 * The prize markers and their bubbles are written and parked in the block above,
 * waiting on the numbers.
 */
export function PrizesSection() {
  const reduceMotion = useReducedMotion() ?? false;

  return (
    <BlockSection
      id="prizes"
      eyebrow="Somebody buried the loot. We drew you a map."
      title="Prizes"
      texture={sculkStillTexture}
      fallbackColor="#0d1217"
      oreTextures={[sculkVeinStillTexture, sculkCatalystTexture]}
      seam={false}
      maxWidthClassName="max-w-5xl"
    >
      <div className="relative mx-auto w-full">
        {/* Sculk light pooling under the map, so it reads as lit by the floor. */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[70%] -translate-x-1/2 -translate-y-1/2"
          style={{
            background: `radial-gradient(closest-side, rgba(${SCULK_GLINT},0.18), rgba(${SCULK_GLINT},0) 70%)`,
          }}
        />

        {/* The only in-flow child, so it alone sets the plate's height — which is
            what makes a marker's y the same number in plate space once the parked
            block above comes back. */}
        <div className="relative mx-auto w-full max-w-sm lg:max-w-none lg:w-[46%]">
          <Rod edge="top" reduceMotion={reduceMotion} />
          <motion.div
            className="relative aspect-square w-full"
            style={{ transformOrigin: "center" }}
            initial={{ scaleY: 0.04, opacity: 0 }}
            whileInView={{ scaleY: 1, opacity: 1 }}
            viewport={VIEWPORT_TALL}
            transition={{ duration: reduceMotion ? 0 : UNFURL, ease: "easeOut" }}
          >
            <img
              src={treasureMapImg.src}
              alt="A treasure map of an island, with the prizes still to be marked."
              className="h-full w-full"
              style={{ imageRendering: "pixelated" }}
            />

            {/* Stands in for the markers until the pool is confirmed. Waits out the
                unfurl, so it lands on an open map rather than a squashed one. */}
            <motion.div
              className="absolute left-1/2 top-1/2 w-[86%] -translate-x-1/2 -translate-y-1/2 text-center"
              style={{ fontFamily: PIXEL_FONT, color: AGED_INK, textShadow: AGED_EMBOSS }}
              initial={{ opacity: 0, y: 6 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={VIEWPORT_TALL}
              transition={{ duration: 0.3, ease: "easeOut", delay: reduceMotion ? 0 : UNFURL }}
            >
              <div className="text-2xl uppercase tracking-[0.16em] sm:text-4xl" style={{ fontWeight: 700 }}>
                Coming soon
              </div>
              <div className="mt-3 text-[11px] leading-snug sm:text-sm">
                The X&apos;s go on once the prize pool is confirmed.
              </div>
            </motion.div>

            {/* PARKED: {PRIZES.map((prize, index) => (
              <Marker key={prize.id} prize={prize} delay={UNFURL + index * STAGGER} reduceMotion={reduceMotion} />
            ))} */}
          </motion.div>
          <Rod edge="bottom" reduceMotion={reduceMotion} />
        </div>

        {/* PARKED: <LeaderLines reduceMotion={reduceMotion} />

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:absolute lg:inset-0 lg:mt-0 lg:block">
          {PRIZES.map((prize, index) => (
            <Bubble key={prize.id} prize={prize} delay={UNFURL + index * STAGGER + 0.05} reduceMotion={reduceMotion} />
          ))}
        </div> */}
      </div>
    </BlockSection>
  );
}
