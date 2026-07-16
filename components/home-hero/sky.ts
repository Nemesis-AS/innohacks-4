// Sky color stops and celestial trajectory math for the day/night hero animation.
// Colors approximate the Minecraft overworld sky.

export type RGB = [number, number, number];

type SkyStop = { progress: number; top: RGB; bottom: RGB };

const SKY_STOPS: SkyStop[] = [
  { progress: 0.0, top: [131, 165, 240], bottom: [172, 199, 244] }, // noon, nudged slightly toward dusk for the initial view
  { progress: 0.42, top: [120, 167, 255], bottom: [165, 200, 255] }, // still day
  { progress: 0.48, top: [255, 140, 70], bottom: [255, 190, 120] }, // sunset
  { progress: 0.55, top: [40, 30, 90], bottom: [180, 90, 70] }, // dusk
  { progress: 0.62, top: [4, 6, 20], bottom: [10, 12, 35] }, // night begins
  { progress: 0.85, top: [2, 3, 12], bottom: [4, 6, 20] }, // deep night
  { progress: 0.95, top: [40, 30, 90], bottom: [200, 110, 80] }, // sunrise hint
  { progress: 1.0, top: [120, 167, 255], bottom: [165, 200, 255] }, // back to day
];

const rgb = ([r, g, b]: RGB) => `rgb(${r}, ${g}, ${b})`;

// The cycle above is authored over a full 0..1 day/night rotation, but the hero
// scroll is cut off at CYCLE_CUTOFF — the moment the moon reaches the edge of the
// viewport, just before it would start fading out. The hero therefore ends mid
// night-to-day transition, with the moon still fully opaque.
export const CYCLE_CUTOFF = 0.97;

/** Maps a point in the cycle onto hero scroll progress, which ends at the cutoff. */
export const cycleProgress = (p: number) => p / CYCLE_CUTOFF;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerpRgb = (a: RGB, b: RGB, t: number): RGB => [
  Math.round(lerp(a[0], b[0], t)),
  Math.round(lerp(a[1], b[1], t)),
  Math.round(lerp(a[2], b[2], t)),
];

/**
 * Rescales cycle keyframes onto scroll progress and truncates them at the cutoff,
 * ending the range at exactly 1 with the value the cycle holds there.
 *
 * Truncating matters: scroll-linked opacity is handed to the browser as a native
 * ScrollTimeline animation, where these stops become WAAPI keyframe offsets and
 * must stay within [0,1]. Leaving stops past the cutoff above 1 throws.
 */
function cycleKeyframes<T>(
  stops: number[],
  values: T[],
  lerpValue: (a: T, b: T, t: number) => T,
): [number[], T[]] {
  const outStops: number[] = [];
  const outValues: T[] = [];

  for (let i = 0; i < stops.length; i++) {
    const stop = cycleProgress(stops[i]);
    if (stop < 1) {
      outStops.push(stop);
      outValues.push(values[i]);
      continue;
    }
    // First stop at or past the cutoff: land it on 1, at the interpolated value.
    const previous = i === 0 ? 0 : cycleProgress(stops[i - 1]);
    outStops.push(1);
    outValues.push(i === 0 ? values[0] : lerpValue(values[i - 1], values[i], (1 - previous) / (stop - previous)));
    break;
  }

  return [outStops, outValues];
}

/** Cycle keyframes for a numeric `useTransform`, ready to spread as (inputRange, outputRange). */
export const cycleNumbers = (stops: number[], values: number[]) => cycleKeyframes(stops, values, lerp);

const skyProgress = SKY_STOPS.map((s) => s.progress);
const [skyStops, skyTops] = cycleKeyframes(skyProgress, SKY_STOPS.map((s) => s.top), lerpRgb);
const [, skyBottoms] = cycleKeyframes(skyProgress, SKY_STOPS.map((s) => s.bottom), lerpRgb);

export const SKY_STOP_POSITIONS = skyStops;
export const SKY_TOP_COLORS = skyTops.map(rgb);
export const SKY_BOTTOM_COLORS = skyBottoms.map(rgb);

export function withAlpha(rgbColor: string, alpha: number) {
  return rgbColor.replace("rgb(", "rgba(").replace(")", `, ${alpha})`);
}

// Celestial bodies travel left to right along a wide oval: a high apex at
// cp=0.5 that curves continuously down toward the edges at cp=0/cp=1 (true
// elliptical curvature throughout, not a plateau that flattens to a stop).
// `cp` is the body's own 0..1 progress across that arc (distinct from page
// scroll progress).
const ARC_EDGE_ANGLE = 0.4; // radians; angle at cp=0/cp=1 — smaller = more pointed oval ends, closer to pi/2 = flatter
const ARC_EDGE_INSET = 0.05; // fraction of viewport width kept clear at cp=0/cp=1
const ARC_APEX_Y = 0.07; // fraction of viewport height at the apex (cp=0.5)
const ARC_EDGE_Y = 0.33; // fraction of viewport height at cp=0/cp=1

const ARC_ANGLE_SPAN = Math.PI - 2 * ARC_EDGE_ANGLE;

function angleAt(cp: number) {
  return ARC_EDGE_ANGLE + ARC_ANGLE_SPAN * (1 - cp);
}

function pointAtAngle(angle: number, cx: number, cy: number, rx: number, ry: number) {
  return { x: cx + Math.cos(angle) * rx, y: cy - Math.sin(angle) * ry };
}

// Beyond cp=0/cp=1 the ellipse's own curve would bend back inward (each axis
// has a fixed extreme), which reads as the body looping back on screen.
// Continuing straight along the curve's tangent instead lets it carry on
// past the edge and fully exit the viewport.
function extrapolate(overshoot: number, angle: number, cx: number, cy: number, rx: number, ry: number) {
  const edge = pointAtAngle(angle, cx, cy, rx, ry);
  return {
    x: edge.x + rx * Math.sin(angle) * ARC_ANGLE_SPAN * overshoot,
    y: edge.y + ry * Math.cos(angle) * ARC_ANGLE_SPAN * overshoot,
  };
}

export function trajectory(cp: number, viewportWidth: number, viewportHeight: number) {
  const ry = ((ARC_EDGE_Y - ARC_APEX_Y) * viewportHeight) / (1 - Math.sin(ARC_EDGE_ANGLE));
  const cy = ARC_APEX_Y * viewportHeight + ry;
  const rx = ((0.5 - ARC_EDGE_INSET) * viewportWidth) / Math.cos(ARC_EDGE_ANGLE);
  const cx = viewportWidth * 0.5;

  if (cp < 0) return extrapolate(cp, Math.PI - ARC_EDGE_ANGLE, cx, cy, rx, ry);
  if (cp > 1) return extrapolate(cp - 1, ARC_EDGE_ANGLE, cx, cy, rx, ry);
  return pointAtAngle(angleAt(cp), cx, cy, rx, ry);
}

// Deterministic starfield so the layout doesn't shift between renders.
function mulberry32(seed: number) {
  return function random() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type Star = { x: number; y: number; size: number; twinkleSpeed: number; phase: number };

export function generateStars(count: number, seed = 1337): Star[] {
  const random = mulberry32(seed);
  return Array.from({ length: count }, () => ({
    x: random(),
    y: random() * 0.85,
    size: random() < 0.85 ? 1 : 2,
    twinkleSpeed: 0.4 + random() * 0.6,
    phase: random() * Math.PI * 2,
  }));
}
