"use client";

import { AnimatePresence, motion } from "motion/react";
import type { StaticImageData } from "next/image";
import { useId, useLayoutEffect, useRef, useState } from "react";

import { Glint } from "@/components/minecraft-ui";
import { DUR_MICRO, EASE, POP_SPRING } from "@/util/motion";
import { chamfer, FOCUS_RING, GUI, INK, PIXEL_FONT, plate, SHADOW_SMALL, u } from "@/util/ui";

/**
 * Geometry of the task frame in assets/advancements/widgets.png — the 26x26 cell at
 * x=0, y=128 (obtained) and y=154 (locked). It's a 3px border around a 20px hole that
 * the item shows through, in flat colours:
 *
 *   obtained  outline #000000 · light #dba213 · body #aa7e0f · shade #493606
 *   locked    outline #000000 · light #ffffff · body #c6c6c6 · shade #555555
 *
 * Being flat is what lets the square cell stretch to a landscape rectangle — sponsor
 * marks are wordmarks, not 16x16 items, so a square frame would waste most of the well.
 */
const OUTLINE = 1;
const BORDER = 3;

/** Tail height, and so the gap the tooltip floats above its frame. */
const TAIL_H = 4;
/** Tail width. Three times the tip, so the stair steps in by exactly one tip each side. */
const TAIL_W = 6;

/**
 * The tail's stair step. Percentages rather than `u()`, so the two steps stay exact
 * thirds of TAIL_W and halves of TAIL_H at every `--adv-u` — a calc here would land the
 * notch on a half pixel and antialias the one edge that has to stay hard.
 */
const TAIL_CLIP =
  "polygon(0 0, 100% 0, 100% 50%, 66.6667% 50%, 66.6667% 100%, 33.3333% 100%, 33.3333% 50%, 0 50%)";

/** Keep-out from the viewport edge when the tooltip has to slide back into view. */
const EDGE_PAD = 8;

/**
 * Width of a tooltip carrying a blurb, in sprite pixels — so the measure stays the same
 * number of characters at every `--adv-u`. A rem cap would hand a phone a *longer* line
 * than the desktop, which is backwards.
 *
 * Minecraft.otf's em box is 18 units and prose averages 0.6em a glyph, so at
 * `u(BLURB_FONT)` a character is ~3.6u. Take the u(12) of padding and u(2) of outline
 * off the panel and the two bounds come out at ~27 and ~36 characters.
 *
 * Neither is taste. The floor is the longest sponsor name — ~92u in the u(8) title bar —
 * rounded up, so nothing that fits today starts truncating, and two blurbed frames side
 * by side read as one card repeated rather than two different shapes. The ceiling is the
 * widest the panel can be and still clear a 320px phone before the viewport clamp cuts
 * in: 144 x 2 is exactly 320 less the 2rem keep-out.
 *
 * The floor is deliberately *not* clamped to the viewport — u(112) is 224px, inside any
 * real device. Raise it past ~140 and it has to become `min(u(N), 100%)`, or it starts
 * fighting the edge shift below.
 */
const BLURB_MIN_W = 112;
const BLURB_MAX_W = 144;

/**
 * A blurb sets one step smaller than the tier line it stands in for. The tier line is a
 * label you glance at; a blurb is prose you read several lines of, and at u(7) a long one
 * shouts over the name above it. u(6) also buys back five characters a line, which is
 * what keeps a two-sentence blurb from running to six.
 */
const BLURB_FONT = 6;

/**
 * The blurb's line advance, as a `u()` length rather than a ratio. This font's em box is
 * its glyph box, so a u(6) line is exactly 6 sprite pixels tall and u(8) is that plus a
 * pixel of leading each side — vanilla's own spacing, every baseline on the grid. A
 * unitless 1.3 lands the second line on a half pixel at `--adv-u:3` and drifts the block
 * off the grid the rest of the panel is built on.
 */
const BLURB_LINE_H = 8;

/** One sponsor's mark. Shaped to spread from the section's data, the way `Partner` does. */
export type SponsorMark = {
  name: string;
  logo?: StaticImageData;
  href?: string;
  /** Backing plate behind the mark, for logos that don't carry on the dark well. */
  logoBg?: string;
  /** Defaults to name. */
  alt?: string;
  /**
   * Optional sponsor copy, taking the tier line's place in the tooltip. Most sponsors
   * won't have one, and without it the card is the two-line tooltip it has always been.
   * Keep it to a sentence — it wraps at ~36 characters, and the panel grows upward, out
   * of the well and over whatever window sits above.
   */
  blurb?: string;
};

type AdvancementFrameProps = {
  /** Absent — an unclaimed slot, which renders as the vanilla locked frame. */
  sponsor?: SponsorMark;
  /** Tier name. Becomes the tooltip's description line. */
  tierLabel: string;
  /** Tier colour, tinting that description line to match the window's tab pip. */
  accent: string;
  /** Frame aspect ratio, width over height. */
  aspect: number;
  /** Seconds to hold before the reveal, for staggering a row. */
  delay: number;
  /** Seconds to offset the glint loop by. */
  glintDelay: number;
  reduceMotion: boolean;
  active: boolean;
  /** `viaTouch` marks an open that no pointer-leave will ever close. */
  onActivate: (on: boolean, viaTouch?: boolean) => void;
};

/**
 * Vanilla item tooltip as the advancements screen draws it: the gold title bar carrying
 * the name, and the tier beneath it — or, for a sponsor who supplied copy of their own,
 * that copy in the tier's place.
 *
 * It is one plate, not two boxes. The outer element owns the only outline and the only
 * chamfer; the gold bar inside keeps square corners and a black bottom edge, and the
 * parent's clip trims its outer ones. That's what fuses the halves — chamfering the bar
 * itself cuts notches into the seam where the two meet.
 *
 * The bar is rebuilt in CSS rather than sliced out of widgets.png. The sprite's bar is a
 * fixed 200px wide and a tooltip has to be as wide as its name — but the bar is the same
 * flat plate as everything else on the sheet, so an arbitrary width costs nothing.
 */
function AdvancementTooltip({
  name,
  description,
  blurb,
  accent,
  reduceMotion,
}: {
  name: string;
  description: string;
  /** Optional sponsor copy. Displaces `description` on the plate when it's there. */
  blurb?: string;
  accent: string;
  reduceMotion: boolean;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [shift, setShift] = useState(0);

  /**
   * Slide back into view when centring would hang the panel off a viewport edge. The
   * two-column phone grid puts frames close enough to the edge that a wide tooltip is
   * otherwise half unreadable — and touch is exactly where it gets tapped.
   *
   * A layout effect, so the correction lands before paint rather than as a visible jump.
   * Measuring once per mount is enough: the tooltip mounts fresh on every activation.
   * The reading is trustworthy only because the entry animation moves `y` alone — a
   * scale would be mid-flight here and report a narrower box than the panel settles at.
   */
  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const { left, right } = panel.getBoundingClientRect();
    if (left < EDGE_PAD) setShift(EDGE_PAD - left);
    else if (right > window.innerWidth - EDGE_PAD) {
      setShift(window.innerWidth - EDGE_PAD - right);
    }
  }, []);

  return (
    <motion.div
      aria-hidden
      // Spanning the frame rather than `left-1/2 -translate-x-1/2`: the wrapper is then
      // exactly the frame's width, `justify-center` does the centring with no transform
      // for motion to clobber, and the tail below stays pinned to the *frame's* middle
      // even once the panel has slid sideways.
      className="pointer-events-none absolute inset-x-0 bottom-full z-30"
      initial={{ opacity: 0, y: reduceMotion ? 0 : 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: reduceMotion ? 0 : 6 }}
      transition={
        reduceMotion
          ? { duration: DUR_MICRO, ease: EASE }
          : { y: POP_SPRING, opacity: { duration: DUR_MICRO, ease: EASE } }
      }
      style={{
        paddingBottom: u(TAIL_H),
        // drop-shadow, not box-shadow: the plate is chamfered, and a box-shadow would
        // trace the square box the clip path just cut the corners off. Filtering the
        // wrapper also casts panel and tail as one silhouette instead of two.
        filter: `drop-shadow(${u(2)} ${u(2)} 0 rgba(0,0,0,0.5))`,
      }}
    >
      <div className="flex justify-center">
        <div
          ref={panelRef}
          className="w-max overflow-hidden"
          style={{
            // A transform, not a margin: under `justify-center` a margin is half
            // reabsorbed by the centring itself, so the panel would only travel half
            // the distance it was measured to need. This is a pure post-layout nudge,
            // and it's safe here because motion animates the wrapper, not the panel.
            transform: shift ? `translateX(${shift}px)` : undefined,
            // Two nowrap lines shrink-wrap themselves and the 22rem is only a backstop,
            // so the plain case is left exactly as it was. A blurb moves both bounds onto
            // the sprite grid instead, so its measure survives the breakpoint. The floor
            // isn't what forces the wrap — `w-max` is max-content, and a paragraph's
            // max-content is the whole sentence unwrapped, so the panel reaches the cap
            // on its own. It's there to keep every blurbed card the one width.
            minWidth: blurb ? u(BLURB_MIN_W) : undefined,
            maxWidth: blurb
              ? `min(${u(BLURB_MAX_W)}, calc(100vw - 2rem))`
              : "min(22rem, calc(100vw - 2rem))",
            border: `${u(OUTLINE)} solid ${GUI.outline}`,
            clipPath: chamfer(),
          }}
        >
          <div
            className="overflow-hidden text-ellipsis whitespace-nowrap"
            style={{
              backgroundColor: GUI.earnedBar,
              // The seam. A border on the bar rather than a rule on the half below, so
              // the divider belongs to the same plate the outline does.
              borderBottom: `${u(OUTLINE)} solid ${GUI.outline}`,
              boxShadow: plate(OUTLINE, GUI.earnedLight, GUI.earnedShade),
              color: INK,
              fontFamily: PIXEL_FONT,
              fontSize: u(8),
              lineHeight: 1,
              padding: `${u(5)} ${u(6)}`,
            }}
          >
            {name}
          </div>
          {/* Flat, no bevel — vanilla's description area is unlit. */}
          <div
            className={
              // A blurb is the only thing on this plate allowed to wrap. `break-words`
              // so a long compound or a bare URL can't shove the panel past its cap, and
              // `text-balance` because a one-word last line is glaring in a font this
              // chunky — it quietly gives up past ~6 lines, which a sentence won't reach.
              blurb
                ? "text-balance break-words"
                : "overflow-hidden text-ellipsis whitespace-nowrap"
            }
            style={{
              // Near-opaque, not the 0.86 this used to be: the tooltip floats over the
              // window's *light grey* title bar, and at 0.86 the bar's ink ghosted
              // straight through the tier line. The 4% left is all the translucency
              // that survives a light backdrop.
              backgroundColor: `color-mix(in srgb, ${GUI.wellFill} 96%, transparent)`,
              // The accent stays even once the tier label doesn't. This band is the
              // tier's colour everywhere in the section, and a blurb in neutral grey
              // would put two colour rules inside one grid — the label is what a blurb
              // trades away, not the tier.
              color: accent,
              fontFamily: PIXEL_FONT,
              // A step down from the name, so it reads as subordinate — and the width
              // that gives back is what stops "Refreshment Partner" truncating at lg. A
              // blurb steps down once more; see BLURB_FONT.
              fontSize: blurb ? u(BLURB_FONT) : u(7),
              lineHeight: blurb ? u(BLURB_LINE_H) : 1,
              // u(3) under a blurb, not u(4): a wrapped block's first and last line boxes
              // already carry half a leading each, so u(4) would optically over-pad it
              // against the single tier line it stands in for.
              padding: blurb ? `${u(3)} ${u(6)}` : `${u(4)} ${u(6)}`,
              textShadow: SHADOW_SMALL,
            }}
          >
            {blurb ?? description}
          </div>
        </div>
      </div>
      {/*
        Solid outline colour rather than an outlined fill: the half above it is already
        near-black, so the two read as one shape, and a 2px stair with its own border
        would cost three more spans to say the same thing.
      */}
      <span
        className="absolute bottom-0 left-1/2 -translate-x-1/2"
        style={{
          width: u(TAIL_W),
          height: u(TAIL_H),
          backgroundColor: GUI.outline,
          clipPath: TAIL_CLIP,
        }}
      />
    </motion.div>
  );
}

/**
 * One sponsor in a vanilla advancement frame. Claimed sponsors take the gold obtained
 * frame, unclaimed slots the grey locked one with vanilla's "???".
 *
 * The gold reads as a border with the well showing through the middle, the way the
 * sprite does. Filling the frame with gold instead would drop fourteen white logo plates
 * straight onto a gold field with nothing between them.
 */
export function AdvancementFrame({
  sponsor,
  tierLabel,
  accent,
  aspect,
  delay,
  glintDelay,
  reduceMotion,
  active,
  onActivate,
}: AdvancementFrameProps) {
  // Ahead of the unclaimed-slot return below: a hook can't sit after an early exit, and
  // an id nothing points at costs nothing.
  const blurbId = useId();

  const light = sponsor ? GUI.earnedLight : GUI.panelLight;
  const body = sponsor ? GUI.earnedBody : GUI.panelBody;
  const shade = sponsor ? GUI.earnedShade : GUI.panelShade;

  const face = (
    <>
      <span
        aria-hidden
        className="absolute inset-0"
        style={{
          backgroundColor: body,
          border: `${u(OUTLINE)} solid ${GUI.outline}`,
          boxShadow: plate(OUTLINE, light, shade),
          clipPath: chamfer(),
        }}
      />
      <span
        className="absolute flex items-center justify-center overflow-hidden"
        style={{
          inset: u(BORDER),
          backgroundColor: sponsor?.logoBg ?? GUI.wellFill,
          // A hairline between a white logo plate and the gold, which would otherwise butt.
          boxShadow: `inset 0 0 0 ${u(OUTLINE)} rgba(0,0,0,0.85)`,
        }}
      >
        {sponsor?.logo ? (
          // Sponsor marks aren't pixel art, so these render smoothly rather than pixelated.
          <img
            src={sponsor.logo.src}
            alt=""
            className="max-h-full max-w-full object-contain"
            style={{ padding: u(4) }}
          />
        ) : (
          <span
            className="select-none"
            style={{
              color: GUI.panelLight,
              fontFamily: PIXEL_FONT,
              fontSize: u(10),
              letterSpacing: "0.2em",
              textShadow: SHADOW_SMALL,
            }}
          >
            ???
          </span>
        )}
      </span>
      {sponsor && !reduceMotion && <Glint delay={glintDelay} />}
    </>
  );

  // An unclaimed slot is scenery. Announcing "???" as a sponsor helps nobody.
  if (!sponsor) {
    return (
      <div aria-hidden className="relative" style={{ aspectRatio: aspect }}>
        {face}
      </div>
    );
  }

  const label = `${sponsor.name} — ${tierLabel}`;
  // The tooltip is aria-hidden chrome, so a blurb has to reach a screen reader by some
  // other route. A description rather than part of the name: in a list of links this
  // should still announce "Devfolio — Hosting Partner", with the sentence following it.
  // It also hands back the tier label that a blurb takes away from sighted users.
  const describedBy = sponsor.blurb ? blurbId : undefined;
  // overflow-hidden clips the glint sweep; the tooltip lives outside this box, on the
  // wrapper, so it can rise past the frame and out of the well.
  const faceClassName = `group relative block h-full w-full overflow-hidden ${FOCUS_RING}`;

  const activate = () => onActivate(true);
  const deactivate = () => onActivate(false);

  return (
    <motion.div
      className="relative"
      style={{ aspectRatio: aspect }}
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={reduceMotion ? { duration: 0.3 } : { ...POP_SPRING, delay }}
      // A small lift: these sit *in* a well now, so a big translate reads as broken.
      whileHover={reduceMotion ? undefined : { y: -2 }}
      onHoverStart={activate}
      onHoverEnd={deactivate}
      onTapStart={(event) => {
        if ((event as PointerEvent).pointerType === "mouse") return;
        // Touch raises no hover-end and no blur, so this open has to time itself out.
        onActivate(true, true);
      }}
      onFocus={activate}
      onBlur={deactivate}
    >
      {sponsor.href ? (
        <a
          href={sponsor.href}
          target="_blank"
          rel="noreferrer noopener"
          aria-label={label}
          aria-describedby={describedBy}
          className={faceClassName}
        >
          {face}
        </a>
      ) : (
        // Focusable even without a link, so keyboard users reach the tooltip at all.
        <div
          role="img"
          aria-label={label}
          aria-describedby={describedBy}
          tabIndex={0}
          className={faceClassName}
        >
          {face}
        </div>
      )}
      {/*
        Outside the face, not in it: `aria-label` already overrides children for the name,
        so in there this would be dead weight in the tree. `sr-only` is absolutely
        positioned and clipped to a pixel, so neither the `relative` parent nor the face's
        own overflow-hidden has any say over it.
      */}
      {sponsor.blurb && (
        <span id={blurbId} className="sr-only">
          {sponsor.blurb}
        </span>
      )}
      <AnimatePresence>
        {active && (
          <AdvancementTooltip
            key="tip"
            name={sponsor.name}
            description={tierLabel}
            blurb={sponsor.blurb}
            accent={accent}
            reduceMotion={reduceMotion}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
