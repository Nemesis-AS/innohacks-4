"use client";

import { motion, useReducedMotion } from "motion/react";
import { type CSSProperties, useEffect, useState } from "react";
import chainStrip from "@/assets/chain_strip.png";
import chainStripRotated from "@/assets/chain_strip_rotated.png";
import coalDeepslateTexture from "@/assets/coal_deepslate.png";
import deepslateTexture from "@/assets/deepslate.png";
import diamondDeepslateTexture from "@/assets/diamond_deepslate.png";
import ironDeepslateTexture from "@/assets/iron_deepslate.png";
import minecartImg from "@/assets/minecart.png";
import oakLogTexture from "@/assets/oak_log.png";
import railStrip from "@/assets/rail_strip.png";
import { BlockSection } from "./block-section";

const PIXEL_FONT =
  "var(--font-minecraft), ui-monospace, 'Courier New', monospace";
/** The oak peg each row's rail is pinned to the chain by. */
const PEG_SIZE = 16;

/**
 * Chain, at 2 screen pixels per texel — the scale the block textures around it
 * are drawn at, so a link reads as the same size as half an ore speckle.
 *
 * The strips (see `scripts/generate-chain-strips.mjs`) are the bare 6x16 chain,
 * cropped out of the vanilla sheet's transparent gutter, plus a quarter-turned
 * copy. Both tile along their long axis and only along it: `repeat` in the short
 * direction would lay a second chain alongside the first.
 */
const CHAIN_SCALE = 2;
const CHAIN_THICKNESS = chainStrip.width * CHAIN_SCALE;
const CHAIN_TILE = chainStrip.height * CHAIN_SCALE;
/**
 * Iron on darkened deepslate is grey on grey, and the links are two texels wide,
 * so unlit the chain all but disappears into the wall. `drop-shadow` traces the
 * alpha rather than the box, which is what the gaps between links need — a
 * `box-shadow` would outline a 12px rectangle. Tight pass for the edge, wide one
 * for the halo that lifts it off the stone.
 */
const CHAIN_GLOW =
  "drop-shadow(0 0 2px rgba(233,240,255,0.85)) drop-shadow(0 0 6px rgba(198,213,255,0.4))";

/**
 * Banner cloth. Wool in Minecraft is a flat dye colour with a woven speckle over
 * it, so the base is a solid fill and the weave is two low-alpha gradients on top
 * rather than a texture file — at this size a 16px wool tile would either tile
 * visibly or blur. Blue keeps the banners off the deepslate behind them without
 * colliding with the earthier track palette next door.
 */
const CLOTH = "#39418a";
const CLOTH_EDGE = "#212752";
/** The bordure: a Minecraft banner is rarely plain, and it frames the text. */
const CLOTH_TRIM = "rgba(206, 214, 255, 0.24)";
/**
 * The chain the cloth hangs from, poking out either side of it. Thickness is the
 * chain's own, so the links stay square rather than being squashed to fit.
 */
const BANNER_ROD = CHAIN_THICKNESS;
const BANNER_ROD_OVERHANG = 10;

// Minecart. Rendered width; the height follows the art so the cart never squashes.
const CART_WIDTH = 76;
const CART_HEIGHT = Math.round(
  CART_WIDTH * (minecartImg.height / minecartImg.width),
);
/**
 * Gap between the banner's leading edge and the cart's tail, bridged by the
 * coupling bar. Wide enough that the parked cart clears the peg on the post
 * rather than sitting on top of it: the banner's inner edge is half a `gap-10`
 * (20px) short of the post, so at 32px the cart's tail lands ~12px past the
 * post's centre and its nose ~88px past.
 */
const CART_LEAD = 32;
/**
 * How far the cart's base sits above the row's centre line — which is where the
 * rail's running surface is hung, so this is how deep the wheels sit into it.
 * The cap is a few pixels of bright iron; parking the cart exactly on top of it
 * leaves the wheels floating over the track rather than on it.
 */
const CART_RIDE = 2;
const COUPLING_HEIGHT = 4;

/**
 * Rail track (see `scripts/generate-rail-strip.mjs`): one sleeper's worth of the
 * `assets/rails.png` render, keyed off its green screen, levelled, and cut to a
 * whole sleeper so it tiles.
 *
 * Sized by the sleeper rhythm rather than by the height — that rhythm is what
 * reads as the track's scale next to the cart, and a whole number of pixels keeps
 * `repeat-x` off half-pixel boundaries, where it would seam. The height follows
 * the art.
 */
const RAIL_TILE = 32;
const RAIL_HEIGHT = Math.round((railStrip.height * RAIL_TILE) / railStrip.width);
/**
 * The row of the art the near rail's cap runs along — the one a wheel would rest
 * on. The view is oblique, so it is well below the middle of the strip: above it
 * sit the sleepers and the far rail, below it only the sleepers' near ends.
 */
const RAIL_SURFACE = Math.round((30 / railStrip.height) * RAIL_HEIGHT);

/** How far a banner hauls in from, as a share of its own width, on desktop. */
const HAUL = "115%";
/** Below `md` there is no room for the full haul, so the sign just slides. */
const NUDGE = 60;

type TimelineEvent = { time: string; title: string; description: string };

const EVENTS: TimelineEvent[] = [
  {
    time: "Day 1 · 8:00 AM - 9:30 AM",
    title: "Physical Check-In",
    description: "Library",
  },
  {
    time: "Day 1 · 8:30 AM - 9:30 AM",
    title: "Breakfast",
    description: "Cafeteria (1st Floor)",
  },
  {
    time: "Day 1 · 10:00 AM - 11:00 AM",
    title: "Opening Ceremony",
    description: "KSOP (Hall)",
  },
  {
    time: "Day 1 · 11:00 AM Onwards",
    title: "Start Hacking",
    description: "Library (1st Floor)",
  },
  {
    time: "Day 1 · 1:30 PM - 2:30 PM",
    title: "Lunch",
    description: "Cafeteria (1st Floor)",
  },
  {
    time: "Day 1 · 4:00 PM",
    title: "Mentoring Round - 1",
    description: "Library",
  },
  {
    time: "Day 1 · 5:00 PM - 6:00 PM",
    title: "Snacks",
    description: "Cafeteria (1st Floor)",
  },
  {
    time: "Day 1 · 6:30 PM - 7:30 PM",
    title: "Workshops",
    description: "Library",
  },
  {
    time: "Day 1 · 8:30 PM - 9:30 PM",
    title: "Dinner",
    description: "Cafeteria (1st Floor)",
  },
  {
    time: "Day 1 · 10:30 PM - 11:00 PM",
    title: "Mentoring Round - 2",
    description: "Library",
  },
  {
    time: "Day 2 · 11:00 AM - 1:00 PM",
    title: "Judging Round",
    description: "Library",
  },
  {
    time: "Day 2 · 1:00 PM - 2:00 PM",
    title: "Lunch",
    description: "Cafeteria (1st Floor)",
  },
  {
    time: "Day 2 · 2:00 PM - 3:30 PM",
    title: "Speaker Session & Closing Ceremony",
    description: "Auditorium",
  },
];

/**
 * Tracks the `md` breakpoint, the point where the layout goes from one column
 * beside a left-hand post to two columns either side of a centred one.
 *
 * A Tailwind class cannot do this job: the carts only make sense in the
 * two-column layout, and the haul distance and direction are motion `x` values,
 * which no breakpoint can reach. Starts `false` so the server and the first
 * client render agree; the effect settles it long before this section, six
 * screens down, is anywhere near the viewport.
 */
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 768px)");
    const sync = () => setIsDesktop(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  return isDesktop;
}

/**
 * The track a cart rolls in on: oak sleepers between two iron rails, seen from
 * just off the line.
 *
 * Spans the whole row and stays put while the cart travels — a rail that slid in
 * with its cart would read as scenery being dragged, not as track. It sits behind
 * the (opaque) banner, so what actually shows is the empty half of the row and the
 * gap the cart parks over.
 *
 * Hung by its running surface rather than by its box: the art is deeper above
 * that surface than below it, so centring the strip on the row would leave the
 * cart riding several pixels of thin air.
 *
 * No `imageRendering: pixelated`, unlike the block textures — this is an
 * anti-aliased render being scaled down, the same call as the cart it carries.
 */
function Rail({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <motion.div
      aria-hidden
      className="absolute inset-x-0 top-1/2"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: reduceMotion ? 0.3 : 0.5, ease: "easeOut" }}
      style={{
        height: RAIL_HEIGHT,
        marginTop: -RAIL_SURFACE,
        backgroundImage: `url(${railStrip.src})`,
        backgroundSize: `${RAIL_TILE}px ${RAIL_HEIGHT}px`,
        backgroundRepeat: "repeat-x",
      }}
    />
  );
}

/**
 * The cart doing the pulling, hitched to the banner's leading edge.
 *
 * Lives inside the banner rather than beside it, so the two travel as one body at
 * one speed — the cart leads by exactly `CART_LEAD` for the whole haul, and comes
 * to rest past the post while the banner stops where it has always stopped.
 *
 * `heading` is the direction of travel, which is also the side of the banner the
 * cart rides on: a left-column banner is hauled rightward across the post, a
 * right-column one leftward.
 *
 * No `imageRendering: pixelated` here, unlike the block textures around it — this
 * is an anti-aliased render being scaled down, where nearest-neighbour would just
 * alias it to bits (same call as the allay art).
 */
function MineCart({ heading }: { heading: "left" | "right" }) {
  const forward = heading === "right";
  // Hitched to whichever edge of the banner is leading, with the coupling running
  // back from the cart's tail to that same edge.
  const hitch: CSSProperties = forward
    ? { left: "100%", marginLeft: CART_LEAD }
    : { right: "100%", marginRight: CART_LEAD };
  const coupling: CSSProperties = forward ? { right: "100%" } : { left: "100%" };

  return (
    <div
      aria-hidden
      className="absolute"
      style={{
        ...hitch,
        bottom: `calc(50% + ${CART_RIDE}px)`,
        width: CART_WIDTH,
        height: CART_HEIGHT,
      }}
    >
      {/* Coupling: the bar the banner is dragged along by. */}
      <div
        className="absolute"
        style={{
          ...coupling,
          bottom: CART_HEIGHT / 4,
          width: CART_LEAD,
          height: COUPLING_HEIGHT,
          backgroundColor: "#6e6e6e",
          borderTop: "1px solid #8f8f8f",
          borderBottom: "1px solid #2e2e2e",
        }}
      />
      <img
        src={minecartImg.src}
        alt=""
        width={CART_WIDTH}
        height={CART_HEIGHT}
        className="block"
        style={forward ? undefined : { transform: "scaleX(-1)" }}
      />
    </div>
  );
}

/**
 * Dark wash over the deepslate section, so it reads as deeper underground than the stone
 * above it. Shared with the BlockTransition strips on either side (see app/page.tsx) so
 * their deepslate blocks stay in step — tune here and both boundaries follow.
 */
export const DEEPSLATE_DARKEN = 0.45;

export function TimelineSection() {
  const reduceMotion = useReducedMotion() ?? false;
  const isDesktop = useIsDesktop();

  return (
    <BlockSection
      id="timeline"
      eyebrow="Deepslate Block"
      title="Timeline"
      texture={deepslateTexture}
      fallbackColor="#3a3a3e"
      oreTextures={[
        coalDeepslateTexture,
        ironDeepslateTexture,
        diamondDeepslateTexture,
      ]}
      darken={DEEPSLATE_DARKEN}
      seam={false}
      maxWidthClassName="max-w-4xl"
    >
      {/*
        Keyed on the breakpoint so the rows remount when it resolves. Motion reads
        `initial` once, at mount, and `useIsDesktop` cannot know the answer until
        its effect has run — without the remount every row would keep the narrow
        layout's entry offset for the rest of the page's life. The remount lands
        immediately after hydration, with the section far offscreen and nothing
        animated yet, so it costs nothing visible.
      */}
      <div
        key={isDesktop ? "wide" : "narrow"}
        className="relative flex flex-col gap-14 py-6"
      >
        {/*
          The chain the whole timeline hangs off. Unlike the post it replaced it
          has holes in it, so the deepslate reads straight through the links —
          which is the point, and also why it carries no outline: a border would
          box the gaps back in.
        */}
        <div
          className="absolute top-0 bottom-0 left-6 md:left-1/2 md:-translate-x-1/2"
          style={{
            width: CHAIN_THICKNESS,
            backgroundImage: `url(${chainStrip.src})`,
            backgroundSize: `${CHAIN_THICKNESS}px ${CHAIN_TILE}px`,
            backgroundRepeat: "repeat-y",
            imageRendering: "pixelated",
            filter: CHAIN_GLOW,
          }}
        />

        {EVENTS.map((event, index) => {
          const isRight = index % 2 === 1;
          // Travel direction, and so the side the cart is hitched to: a banner in
          // the left column is hauled rightward across the post, and vice versa.
          const heading = isRight ? "left" : "right";
          const haul = isRight ? HAUL : `-${HAUL}`;

          return (
            <div
              key={`${event.title}__${index}`}
              className="relative grid grid-cols-1 md:grid-cols-2 md:gap-10"
            >
              {isDesktop && <Rail reduceMotion={reduceMotion} />}

              <div
                className="absolute top-1/2 left-6 -translate-x-1/2 -translate-y-1/2 md:left-1/2"
                style={{
                  width: PEG_SIZE,
                  height: PEG_SIZE,
                  backgroundImage: `url(${oakLogTexture.src})`,
                  backgroundSize: "100% 100%",
                  imageRendering: "pixelated",
                  border: "2px solid #3a2615",
                }}
              />
              <motion.div
                initial={
                  reduceMotion
                    ? { opacity: 0 }
                    : { opacity: 0, x: isDesktop ? haul : isRight ? NUDGE : -NUDGE }
                }
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{
                  duration: reduceMotion ? 0.3 : isDesktop ? 0.85 : 0.5,
                  ease: "easeOut",
                  // Its own faster leg, so the cart is visible for the length of
                  // the haul instead of fading up as it arrives.
                  opacity: { duration: 0.3, ease: "easeOut" },
                }}
                className={`relative ml-14 flex flex-col gap-1.5 px-6 py-5 md:ml-0 ${isRight ? "md:col-start-2" : ""}`}
                style={{
                  backgroundColor: CLOTH,
                  // The weave: a 2px cross-hatch of light and shadow over the dye,
                  // which is what wool is up close. Kept faint so the text stays
                  // the loudest thing on the cloth.
                  backgroundImage: [
                    "repeating-linear-gradient(90deg, rgba(255,255,255,0.05) 0 2px, rgba(0,0,0,0.05) 2px 4px)",
                    "repeating-linear-gradient(0deg, rgba(0,0,0,0.05) 0 2px, rgba(255,255,255,0.04) 2px 4px)",
                  ].join(", "),
                  border: `3px solid ${CLOTH_EDGE}`,
                  boxShadow: `inset 0 3px 0 rgba(255,255,255,0.12), inset 0 -6px 10px rgba(0,0,0,0.28), 0 12px 24px rgba(0,0,0,0.45)`,
                }}
              >
                {/* The chain, with the cloth hanging off it. */}
                <div
                  aria-hidden
                  className="absolute"
                  style={{
                    // Offsets are measured from the padding box, so the 3px border
                    // has to be added back for the chain to sit flush on the
                    // cloth's top edge and overhang it evenly.
                    top: -(BANNER_ROD + 3),
                    left: -(BANNER_ROD_OVERHANG + 3),
                    right: -(BANNER_ROD_OVERHANG + 3),
                    height: BANNER_ROD,
                    backgroundImage: `url(${chainStripRotated.src})`,
                    backgroundSize: `${CHAIN_TILE}px ${CHAIN_THICKNESS}px`,
                    backgroundRepeat: "repeat-x",
                    imageRendering: "pixelated",
                    filter: CHAIN_GLOW,
                  }}
                />
                {/* Bordure — the banner pattern, and a frame for the text. */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute"
                  style={{
                    inset: 5,
                    border: `3px solid ${CLOTH_TRIM}`,
                  }}
                />

                <span
                  className="text-xs uppercase tracking-[0.2em] text-white/70 md:text-sm"
                  style={{ fontFamily: PIXEL_FONT }}
                >
                  {event.time}
                </span>
                <span
                  className="text-sm uppercase text-white md:text-base"
                  style={{ fontFamily: PIXEL_FONT }}
                >
                  {event.title}
                </span>
                <span
                  className="text-xs text-white/80 md:text-sm"
                  style={{ fontFamily: PIXEL_FONT }}
                >
                  {event.description}
                </span>

                {isDesktop && <MineCart heading={heading} />}
              </motion.div>
            </div>
          );
        })}
      </div>
    </BlockSection>
  );
}
