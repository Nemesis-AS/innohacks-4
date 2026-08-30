/**
 * Cuts the timeline's tiling rail out of `assets/rails.png`.
 *
 *   node scripts/generate-rail-strip.mjs
 *
 * Committed output, run by hand — same deal as the other scripts here.
 *
 * The source is a render of a long stretch of track shot against a green screen,
 * so the ground shows through the gaps between the sleepers as flat green rather
 * than as transparency. It also lands on the canvas very slightly nose-up (about
 * 7px of rise across its 1920px), and it is far longer than any row of the
 * timeline needs.
 *
 * Three passes fix all three, in order:
 *
 *   1. Key the green out. A hard threshold alone would leave a green rim on every
 *      sleeper — the render is anti-aliased, so the boundary pixels are part rail
 *      and part screen — hence the soft band and the despill below.
 *   2. Shear the tilt out, so the rail is level and a cut's two ends line up.
 *   3. Crop to a whole number of sleepers, which is what makes the result tile:
 *      `repeat-x` on anything else would show the sleeper rhythm stutter at every
 *      seam.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { decodePng, encodePng } from "./png.mjs";

const SOURCE = "assets/rails.png";
const OUT = "assets/rail_strip.png";

/**
 * Greenness — how far the green channel runs ahead of the strongest of the other
 * two. On the screen itself (around 15,92,0) it is ~77; on the oak sleepers and
 * the iron rails, which are warm or neutral, it is at or below zero. Nothing in
 * the art is actually green, so this one number separates subject from screen.
 */
const greenness = (r, g, b) => g - Math.max(r, b);
/** Above this a pixel is screen; below `KEY_LOW` it is rail; between, a blend. */
const KEY_HIGH = 45;
const KEY_LOW = 10;
/** Below this a pixel counts as a hole rather than art, when measuring the rail. */
const ALPHA_FLOOR = 32;

// --- 1. Key -----------------------------------------------------------------

const source = decodePng(readFileSync(SOURCE));
const { width, height } = source;
const keyed = Buffer.from(source.rgba);

for (let i = 0; i < width * height; i++) {
  const at = i * 4;
  if (keyed[at + 3] === 0) continue;

  const r = keyed[at];
  const g = keyed[at + 1];
  const b = keyed[at + 2];
  const green = greenness(r, g, b);
  if (green <= 0) continue;

  // Partly-green pixels lose part of their alpha rather than all or none of it,
  // which is what keeps the sleepers' edges soft instead of stair-stepped.
  const cover = Math.min(1, Math.max(0, (green - KEY_LOW) / (KEY_HIGH - KEY_LOW)));
  keyed[at + 3] = Math.round(keyed[at + 3] * (1 - cover));
  // Despill: whatever survives keeps the screen's colour cast until the green
  // channel is pulled back level with the other two.
  keyed[at + 1] = Math.max(r, b);
}

// --- 2. Level ---------------------------------------------------------------

/** The rail's top and bottom edge in a column, or -1 for a column of holes. */
function edges(pixels, x) {
  let top = -1;
  let bottom = -1;
  for (let y = 0; y < height; y++) {
    if (pixels[(y * width + x) * 4 + 3] > ALPHA_FLOOR) { top = y; break; }
  }
  for (let y = height - 1; y >= 0; y--) {
    if (pixels[(y * width + x) * 4 + 3] > ALPHA_FLOOR) { bottom = y; break; }
  }
  return { top, bottom };
}

/** Least-squares fit of the top edge; its gradient is the tilt to shear out. */
let columns = 0;
let sumX = 0;
let sumY = 0;
let sumXX = 0;
let sumXY = 0;
for (let x = 0; x < width; x++) {
  const { top } = edges(keyed, x);
  if (top < 0) continue;
  columns++;
  sumX += x;
  sumY += top;
  sumXX += x * x;
  sumXY += x * top;
}
const tilt = (columns * sumXY - sumX * sumY) / (columns * sumXX - sumX * sumX);

/**
 * One channel of the keyed render, premultiplied. Interpolating straight RGBA
 * would drag the colour of the transparent side into the edge; premultiplying
 * keeps it out (same reasoning as the downscale in scripts/trim-png.mjs).
 */
function sample(x, y, channel) {
  if (y < 0 || y >= height) return 0;
  const at = (y * width + x) * 4;
  return channel === 3 ? keyed[at + 3] : (keyed[at + channel] * keyed[at + 3]) / 255;
}

/**
 * Vertical shear, sampled between the two rows the shifted pixel falls between:
 * the tilt works out at a fraction of a pixel per column, so rounding to whole
 * rows would put a visible staircase along a rail a few pixels thick.
 */
const level = Buffer.alloc(width * height * 4);
for (let x = 0; x < width; x++) {
  const shift = tilt * x; // how far this column has drifted down the canvas
  const whole = Math.floor(shift);
  const frac = shift - whole;

  for (let y = 0; y < height; y++) {
    const to = (y * width + x) * 4;
    for (let c = 0; c < 4; c++) {
      const above = sample(x, y + whole, c);
      const below = sample(x, y + whole + 1, c);
      level[to + c] = Math.round(above * (1 - frac) + below * frac);
    }
  }
}

// Undo the premultiply the shear worked in.
for (let i = 0; i < width * height; i++) {
  const at = i * 4;
  const alpha = level[at + 3];
  if (alpha === 0) continue;
  for (let c = 0; c < 3; c++) {
    level[at + c] = Math.min(255, Math.round((level[at + c] * 255) / alpha));
  }
}

// --- 3. Cut a tile ----------------------------------------------------------

/**
 * The sleeper rhythm is about 35.3px, so no single-sleeper cut lands on a whole
 * pixel — the search runs out to several sleepers to let it find a multiple that
 * does. It stays well under the width this has to tile across (a `max-w-4xl`
 * column) so that a row always shows a few whole sleepers either side of its post.
 */
const MIN_PERIOD = 24;
const MAX_PERIOD = 220;
/** Cut from the middle, away from the ends where the render frays. */
const SEARCH_FROM = 500;
const SEARCH_TO = 1300;

/**
 * How far column `x` is from the column a `period` along — the two that would end
 * up against each other were the strip cut that wide and tiled. Summed over the
 * column's every channel, and left squared: only the ordering matters.
 */
function columnDistance(x, period) {
  let total = 0;
  const a = x * 4;
  const b = (x + period) * 4;
  for (let y = 0; y < height; y++) {
    const row = y * width * 4;
    for (let c = 0; c < 4; c++) {
      const delta = level[row + a + c] - level[row + b + c];
      total += delta * delta;
    }
  }
  return total;
}

/**
 * The best cut is the most periodic window, not merely the one whose two end
 * columns happen to match: a window that repeats all the way through is a real
 * run of sleepers, where an end-columns-only test would happily cut mid-sleeper
 * as long as the far end was mid-sleeper too.
 */
let best = { start: SEARCH_FROM, period: MIN_PERIOD, score: Infinity };
for (let period = MIN_PERIOD; period <= MAX_PERIOD; period++) {
  // Running total of the per-column distances, so each candidate window is a
  // subtraction rather than a re-measure of all of its columns.
  const running = new Float64Array(SEARCH_TO + period + 1);
  for (let x = SEARCH_FROM; x < SEARCH_TO + period; x++) {
    running[x + 1] = running[x] + columnDistance(x, period);
  }

  for (let start = SEARCH_FROM; start <= SEARCH_TO; start++) {
    const score = (running[start + period] - running[start]) / (period * height * 4);
    if (score < best.score) best = { start, period, score };
  }
}

/** Rows the cut actually has art in, so the tile's box is the rail itself. */
let top = height;
let bottom = -1;
for (let x = best.start; x < best.start + best.period; x++) {
  const { top: columnTop, bottom: columnBottom } = edges(level, x);
  if (columnTop < 0) continue;
  if (columnTop < top) top = columnTop;
  if (columnBottom > bottom) bottom = columnBottom;
}

const tileWidth = best.period;
const tileHeight = bottom - top + 1;
const tile = Buffer.alloc(tileWidth * tileHeight * 4);
for (let y = 0; y < tileHeight; y++) {
  for (let x = 0; x < tileWidth; x++) {
    const from = ((y + top) * width + x + best.start) * 4;
    level.copy(tile, (y * tileWidth + x) * 4, from, from + 4);
  }
}

const encoded = encodePng(tileWidth, tileHeight, tile);
writeFileSync(OUT, encoded);

console.log(
  `${SOURCE} ${width}x${height}\n` +
    `  sheared out ${(tilt * width).toFixed(1)}px of tilt\n` +
    `  -> ${OUT} ${tileWidth}x${tileHeight} from x=${best.start}` +
    ` (seam ${Math.sqrt(best.score).toFixed(1)}, ${(encoded.length / 1024).toFixed(1)}kB)`,
);
