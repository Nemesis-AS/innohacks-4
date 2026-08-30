"use client";

import { motion, useMotionValue, useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";
import allayLeftImg from "@/assets/allay/allay_left.png";
import allayRightImg from "@/assets/allay/allay_right.png";
import wingsImg from "@/assets/allay/wings.png";
import { useHeaderFade } from "./use-header-fade";

/** Where the allay settles when nothing has its attention, as a fraction of the viewport. */
const HOME_X = 0.86;
const HOME_Y = 0.34;

// It hovers near the cursor, never on it: the chase target is a point on a ring this far
// out, so arriving means parking on the ring rather than landing on the pointer.
const STANDOFF = 130;
/** Inside this it counts as having arrived, and the boredom timer starts. */
const NEAR = 170;

// Attention. It gives up either because it got where it was going, or because the cursor
// stopped being interesting — and once bored, the cursor has to actually travel to win it back.
const SATISFIED_TIME = 1.2;
const ATTENTION_SPAN = 3.5;
const WAKE_DISTANCE = 44;
/** A move counts as "the cursor is live" only if it happened within this long. */
const MOVE_FRESH = 0.2;

// Idle drift, always running underneath everything else — the sway and the bob use
// different periods so the path never resolves into a visible loop.
const SWAY_X = 24;
const SWAY_SPEED = 0.42;
const BOB_Y = 13;
const BOB_SPEED = 1.5;
const BOB_PHASE = 1.1;

/** How hard it closes on its target each frame — chasing with intent, versus drifting. */
const CHASE = 0.03;
const DRIFT = 0.014;
/** Once bored it wanders from wherever it stopped, creeping back home over several seconds. */
const HOME_RETURN = 0.005;

/** Nothing gets closer to a viewport edge than this, so it can never clip out of view. */
const MARGIN = 40;

// Turning. The dead zone stops a near-stationary drift from strobing the sprite, and the
// dwell keeps a flip committed for a beat before the opposite one is allowed.
const FACE_DEADZONE = 0.22;
const FACE_DWELL = 0.4;
const FACE_LERP = 0.2;
/** The turn pinches to a sliver rather than reaching zero, which would flicker the sprite out. */
const TURN_MIN = 0.1;

// Wingbeat: ~7Hz. The sprite holds both wings symmetrically about its centre, so squashing
// it on X reads as a beat without needing the two wings split into separate images.
const FLAP_SPEED = 44;
const FLAP_DEPTH = 0.5;

/** rAF is paused while the tab is hidden, so the first frame back can carry a huge gap. */
const MAX_DELTA = 1 / 20;

/**
 * Per-facing art. Note the crossed filenames: `allay_left.png` is the pose whose face is
 * turned to the viewer's right, so it's the sprite to show when the allay heads right.
 *
 * The three PNGs share no canvas or anchor point, so the wing placement can't be derived
 * from the files — `x`/`y` are the eyeballed point in the sprite box that the wings centre
 * on. They ride much wider than the torso on purpose.
 */
const FACINGS = {
  left: { torso: allayRightImg, wing: { x: "52%", y: "56%" } },
  right: { torso: allayLeftImg, wing: { x: "48%", y: "56%" } },
} as const;

/** Wing span, relative to the sprite box. The wings PNG is mostly transparent padding. */
const WING_WIDTH = "155%";

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

type FacingProps = {
  facing: keyof typeof FACINGS;
  opacity: ReturnType<typeof useMotionValue<number>>;
  flap: ReturnType<typeof useMotionValue<number>>;
};

/**
 * One facing's art: wings behind, torso in front. Both facings stay mounted and swap by
 * opacity so turning never costs a React render.
 *
 * No `imageRendering: pixelated` here, unlike the block textures — these are anti-aliased
 * renders being scaled *down*, where nearest-neighbour would just alias them to bits.
 */
function AllayFacing({ facing, opacity, flap }: FacingProps) {
  const { torso, wing } = FACINGS[facing];

  return (
    <motion.div className="absolute inset-0" style={{ opacity }}>
      {/* `max-w-none` matters: preflight's `img { max-width: 100% }` would otherwise clip
          the span back to the box width and hide the wings behind the torso entirely. */}
      <motion.img
        src={wingsImg.src}
        alt=""
        className="absolute max-w-none -translate-x-1/2 -translate-y-1/2"
        style={{ left: wing.x, top: wing.y, width: WING_WIDTH, scaleX: flap }}
      />
      <motion.img
        src={torso.src}
        alt=""
        className="absolute left-1/2 top-0 h-full w-auto max-w-none -translate-x-1/2"
      />
    </motion.div>
  );
}

/**
 * A decorative allay that hovers over the page from the About section down.
 *
 * It drifts toward the cursor but stops on a ring around it — close, never touching — and
 * once it arrives, or once the cursor has sat still long enough, it loses interest and goes
 * back to bobbing on its own, creeping home. Moving the cursor a real distance wins it back.
 * It turns to face where it's heading and is clamped inside the viewport at all times.
 *
 * Mounted at the layout level rather than inside a section: `BlockSection` wraps its
 * children in `relative z-10`, which would trap the overlay behind later sections.
 */
export function AllayCompanion() {
  const { opacity } = useHeaderFade();
  const reduced = useReducedMotion();

  const spriteRef = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const turn = useMotionValue(1);
  const flap = useMotionValue(1);
  const faceLeft = useMotionValue(1);
  const faceRight = useMotionValue(0);

  // Everything the loop reads lives in a ref — none of it should ever trigger a render.
  const state = useRef({
    vw: 0,
    vh: 0,
    w: 0,
    h: 0,
    cursorX: 0,
    cursorY: 0,
    lastMoveAt: Number.NEGATIVE_INFINITY,
    engaged: false,
    nearFor: 0,
    wakeX: 0,
    wakeY: 0,
    anchorX: Number.NaN,
    anchorY: Number.NaN,
    posX: Number.NaN,
    posY: Number.NaN,
    prevTime: 0,
    facing: 0,
    facingTarget: 0,
    lastFlip: 0,
  });

  useEffect(() => {
    const sprite = spriteRef.current;
    if (!sprite) return;

    const s = state.current;

    // `offsetWidth`/`offsetHeight` rather than a bounding rect: the box carries the turn
    // and flap transforms, and we want its layout size, not its painted one.
    const measure = () => {
      s.vw = window.innerWidth;
      s.vh = window.innerHeight;
      s.w = sprite.offsetWidth;
      s.h = sprite.offsetHeight;
    };
    measure();
    window.addEventListener("resize", measure);

    // Touch and pen never move a cursor, so the guard is also what gives touch devices
    // their behaviour: `lastMoveAt` stays unset, so it never engages and only ever drifts.
    const track = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      s.cursorX = event.clientX;
      s.cursorY = event.clientY;
      s.lastMoveAt = performance.now() / 1000;
    };
    // A cursor that left the window has no position worth chasing. Clearing the timestamp
    // rather than the flag lets the loop's own disengage path run, so it wanders on from
    // where it was instead of glancing off toward a stale anchor.
    const release = () => {
      s.lastMoveAt = Number.NEGATIVE_INFINITY;
    };

    window.addEventListener("pointermove", track, { passive: true });
    document.addEventListener("mouseleave", release);
    window.addEventListener("blur", release);

    let frame = 0;

    if (reduced) {
      // Parked, wings still. Same bail-out as the scroll-scrubbed hero video.
      x.set(s.vw * HOME_X - s.w / 2);
      y.set(s.vh * HOME_Y - s.h / 2);
    } else {
      const tick = (now: number) => {
        frame = requestAnimationFrame(tick);

        const t = now / 1000;
        const dt = s.prevTime ? Math.min(MAX_DELTA, t - s.prevTime) : 1 / 60;
        s.prevTime = t;

        const homeX = s.vw * HOME_X;
        const homeY = s.vh * HOME_Y;
        if (Number.isNaN(s.anchorX)) {
          s.anchorX = homeX;
          s.anchorY = homeY;
        }

        // Centre of the sprite, which is what "distance to the cursor" should mean.
        const centreX = Number.isNaN(s.posX) ? homeX : s.posX + s.w / 2;
        const centreY = Number.isNaN(s.posY) ? homeY : s.posY + s.h / 2;
        const stillFor = t - s.lastMoveAt;

        if (s.engaged) {
          const gap = Math.hypot(s.cursorX - centreX, s.cursorY - centreY);
          s.nearFor = gap < NEAR ? s.nearFor + dt : 0;

          // Two ways to lose interest: it got there, or the cursor stopped being interesting.
          if (s.nearFor > SATISFIED_TIME || stillFor > ATTENTION_SPAN) {
            s.engaged = false;
            s.nearFor = 0;
            // Wander on from wherever it gave up rather than snapping back to home.
            s.anchorX = centreX;
            s.anchorY = centreY;
            s.wakeX = s.cursorX;
            s.wakeY = s.cursorY;
          }
        } else {
          const travelled = Math.hypot(s.cursorX - s.wakeX, s.cursorY - s.wakeY);
          if (stillFor < MOVE_FRESH && travelled > WAKE_DISTANCE) {
            s.engaged = true;
            s.nearFor = 0;
          }
          s.anchorX += (homeX - s.anchorX) * HOME_RETURN;
          s.anchorY += (homeY - s.anchorY) * HOME_RETURN;
        }

        let targetX: number;
        let targetY: number;
        let ease: number;
        if (s.engaged) {
          // Approach radially and park on the standoff ring, on the side it came from.
          const awayX = centreX - s.cursorX;
          const awayY = centreY - s.cursorY;
          const away = Math.hypot(awayX, awayY) || 1;
          targetX = s.cursorX + (awayX / away) * STANDOFF;
          targetY = s.cursorY + (awayY / away) * STANDOFF;
          ease = CHASE;
        } else {
          targetX = s.anchorX;
          targetY = s.anchorY;
          ease = DRIFT;
        }

        // The drift rides on top in both states, so parking on the ring still looks alive.
        targetX += Math.sin(t * SWAY_SPEED) * SWAY_X;
        targetY += Math.sin(t * BOB_SPEED + BOB_PHASE) * BOB_Y;

        // Target is a centre point; the sprite is positioned by its top-left corner.
        targetX -= s.w / 2;
        targetY -= s.h / 2;

        const prevX = s.posX;
        if (Number.isNaN(s.posX)) {
          // First frame: start where it belongs instead of flying in from the origin.
          s.posX = targetX;
          s.posY = targetY;
        } else {
          s.posX += (targetX - s.posX) * ease;
          s.posY += (targetY - s.posY) * ease;
        }

        s.posX = clamp(s.posX, MARGIN, Math.max(MARGIN, s.vw - MARGIN - s.w));
        s.posY = clamp(s.posY, MARGIN, Math.max(MARGIN, s.vh - MARGIN - s.h));

        x.set(s.posX);
        y.set(s.posY);

        const dx = Number.isNaN(prevX) ? 0 : s.posX - prevX;
        let wanted = s.facingTarget;
        if (dx > FACE_DEADZONE) wanted = 1;
        else if (dx < -FACE_DEADZONE) wanted = 0;

        if (wanted !== s.facingTarget && t - s.lastFlip > FACE_DWELL) {
          s.facingTarget = wanted;
          s.lastFlip = t;
        }
        s.facing += (s.facingTarget - s.facing) * FACE_LERP;

        // Swap art at the pinch, where the sprite is at its thinnest and the cut is hidden.
        // A straight opacity crossfade would show both facings half-transparent instead.
        turn.set(Math.max(TURN_MIN, Math.abs(1 - 2 * s.facing)));
        faceLeft.set(s.facing < 0.5 ? 1 : 0);
        faceRight.set(s.facing < 0.5 ? 0 : 1);

        flap.set(1 - FLAP_DEPTH * (0.5 + 0.5 * Math.sin(t * FLAP_SPEED)));
      };
      frame = requestAnimationFrame(tick);
    }

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", measure);
      window.removeEventListener("pointermove", track);
      document.removeEventListener("mouseleave", release);
      window.removeEventListener("blur", release);
    };
  }, [reduced, x, y, turn, flap, faceLeft, faceRight]);

  // z-[9000] clears every section and the header (z-50) but stays under the MLH badge
  // (z-[10000]) and the portaled event book (z-[10050]) — decoration never covers a dialog.
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[9000] overflow-hidden"
      style={{ opacity }}
    >
      <motion.div className="absolute left-0 top-0 will-change-transform" style={{ x, y }}>
        {/* The box sizes the torso; the wings deliberately overhang it on both sides. */}
        <motion.div
          ref={spriteRef}
          className="relative h-14 w-14 md:h-20 md:w-20"
          style={{ scaleX: turn }}
        >
          <AllayFacing facing="left" opacity={faceLeft} flap={flap} />
          <AllayFacing facing="right" opacity={faceRight} flap={flap} />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
