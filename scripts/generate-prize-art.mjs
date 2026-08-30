/**
 * Generates the art the Prizes section needs, from the vanilla textures in `assets/`.
 *
 * Run by hand:
 *
 *   node scripts/generate-prize-art.mjs
 *
 * Deliberately NOT wired into `next build` — like `generate-cursors.mjs`, the
 * outputs are committed. Two jobs:
 *
 *   1. Sculk and sculk vein ship as *animated* textures: 16x64 vertical strips of
 *      four frames, differing only in where the cyan glints sit. Tiling one as-is
 *      would smear four frames down every block, so frame 0 is cropped out into a
 *      still that the block system can tile like any other 16x16 texture.
 *
 *   2. The map itself, which has no vanilla equivalent — in game it is generated
 *      from the world, so it has to be generated here too. It currently ships
 *      blank: bare parchment and a compass, with the drawn island parked in the
 *      commented block near the bottom until the prize pool is confirmed.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { decodePng, encodePng } from "./png.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const assets = join(root, "assets");

// --- Animated textures -----------------------------------------------------

/** Vanilla animation strips, cropped to their first frame. */
const STRIPS = [
  { source: "sculk.png", out: "sculk_still.png" },
  { source: "sculk_vein.png", out: "sculk_vein_still.png" },
];

function cropFirstFrame({ width, height, rgba }) {
  if (height % width !== 0) throw new Error("not a square-framed animation strip");
  return { width, height: width, rgba: rgba.subarray(0, width * width * 4) };
}

for (const { source, out } of STRIPS) {
  const strip = decodePng(readFileSync(join(assets, source)));
  const frame = cropFirstFrame(strip);
  writeFileSync(join(assets, out), encodePng(frame.width, frame.height, frame.rgba));
  console.log(`wrote ${out} (${frame.width}x${frame.height}, frame 1 of ${strip.height / strip.width})`);
}

// --- Treasure map ----------------------------------------------------------

const PAPER_SCALE = 4; // 64px sheet -> 256px map, so the ragged edge stays on pixel bounds
/** Untouched sheet left showing all round the drawn area, in output pixels. */
const MARGIN = 11;

/** The sheet's own light tone, sampled from `assets/map/map_background.png`. */
const PARCHMENT = [214, 190, 150];
/** Ink for the compass — the darkest shade of the vanilla map's dirt colour. */
const INK = [64, 46, 32];

const paper = decodePng(readFileSync(join(assets, "map", "map_background.png")));
const size = paper.width * PAPER_SCALE;
const out = Buffer.alloc(size * size * 4);

// Nearest-neighbour upscale of the sheet, so the ragged parchment edge lands on
// whole pixels instead of being smeared by the browser at render time.
for (let y = 0; y < size; y++) {
  for (let x = 0; x < size; x++) {
    const from = (Math.floor(y / PAPER_SCALE) * paper.width + Math.floor(x / PAPER_SCALE)) * 4;
    out.set(paper.rgba.subarray(from, from + 4), (y * size + x) * 4);
  }
}

/** True where the sheet is opaque and far enough from its edge to draw on. */
const drawable = new Uint8Array(size * size);
for (let y = 0; y < size; y++) {
  for (let x = 0; x < size; x++) {
    let ok = 1;
    // A box erosion of the sheet's alpha. Cheap at this size, and it follows the
    // ragged edge rather than assuming the sheet is a clean square.
    for (let dy = -MARGIN; dy <= MARGIN && ok; dy += MARGIN) {
      for (let dx = -MARGIN; dx <= MARGIN && ok; dx += MARGIN) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= size || ny >= size || out[(ny * size + nx) * 4 + 3] === 0) ok = 0;
      }
    }
    drawable[y * size + x] = ok;
  }
}

const put = (x, y, rgb) => {
  const at = (y * size + x) * 4;
  out[at] = rgb[0];
  out[at + 1] = rgb[1];
  out[at + 2] = rgb[2];
  out[at + 3] = 255;
};

// Flatten the drawable area to the sheet's light tone. The upscaled source carries
// the border's shading across the middle in places; the map is meant to read as one
// clean surface, with the shading only where the edge is torn.
for (let y = 0; y < size; y++) {
  for (let x = 0; x < size; x++) {
    if (drawable[y * size + x]) put(x, y, PARCHMENT);
  }
}

/** Four-point compass rose, tucked into a corner. */
function compass(cx, cy, arm) {
  for (let i = -arm; i <= arm; i++) {
    const taper = Math.round(((arm - Math.abs(i)) / arm) * 1.5);
    for (let t = -taper; t <= taper; t++) {
      if (drawable[(cy + i) * size + cx + t]) put(cx + t, cy + i, INK);
      if (drawable[(cy + t) * size + cx + i]) put(cx + i, cy + t, INK);
    }
  }
  // North tick: a notch above the vertical arm, so the rose has an orientation.
  for (let i = 1; i <= 3; i++) {
    const y = cy - arm - 2 - i;
    if (y > 0 && drawable[y * size + cx]) {
      put(cx - 1, y, INK);
      put(cx + 1, y, INK);
    }
  }
}

compass(size - MARGIN - 26, MARGIN + 28, 12);

/*
 * ---------------------------------------------------------------------------
 * PARKED: THE DRAWN MAP
 * ---------------------------------------------------------------------------
 * The island, in real Minecraft map colours, plus the dashed trail that runs
 * between the three podium markers. Parked with the markers themselves — a drawn
 * map with nothing marked on it invites the eye to look for X's that aren't
 * there, so the sheet ships blank until the prize pool is confirmed.
 *
 * Uncomment this whole block (and the markers in `prizes-section.tsx`) to bring
 * it back; it only needs to run before `compass(...)` above. `TRAIL` is kept in
 * step by hand with `PODIUM` in that file — the trail is drawn between those
 * three points, so it only reads correctly if the two agree.
 *
 * const SEED = 20260214; // fixed: the committed PNG must not churn between runs
 *
 * // Vanilla map colours. In game every map pixel is one of these bases at one of
 * // four brightnesses, which is exactly what gives a filled map its banded look —
 * // so the terrain is quantised the same way rather than blended.
 * const SHADES = [180, 220, 255, 135];
 * const MAP = {
 *   water: [64, 64, 255],
 *   grass: [127, 178, 56],
 *   sand: [247, 233, 163],
 *   foliage: [0, 124, 0],
 *   stone: [112, 112, 112],
 *   dirt: [151, 109, 77],
 *   snow: [255, 255, 255],
 * };
 *
 * const shade = (base, level) => base.map((c) => (c * SHADES[level]) >> 8);
 *
 * // The same generator the sections use for their seeded randomness.
 * function mulberry32(seed) {
 *   let a = seed >>> 0;
 *   return () => {
 *     a = (a + 0x6d2b79f5) >>> 0;
 *     let t = Math.imul(a ^ (a >>> 15), 1 | a);
 *     t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
 *     return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
 *   };
 * }
 *
 * const smooth = (t) => t * t * (3 - 2 * t);
 *
 * // Tiling value noise: a lattice of random values sampled with smoothed bilinear
 * // interpolation. Cheaper than gradient noise and, at these sizes, indistinguishable.
 * function lattice(random, n) {
 *   const values = new Float64Array(n * n);
 *   for (let i = 0; i < values.length; i++) values[i] = random();
 *
 *   return (u, v) => {
 *     const x = u * n;
 *     const y = v * n;
 *     const x0 = Math.floor(x);
 *     const y0 = Math.floor(y);
 *     const fx = smooth(x - x0);
 *     const fy = smooth(y - y0);
 *     const xa = ((x0 % n) + n) % n;
 *     const ya = ((y0 % n) + n) % n;
 *     const xb = (xa + 1) % n;
 *     const yb = (ya + 1) % n;
 *
 *     const top = values[ya * n + xa] * (1 - fx) + values[ya * n + xb] * fx;
 *     const bottom = values[yb * n + xa] * (1 - fx) + values[yb * n + xb] * fx;
 *     return top * (1 - fy) + bottom * fy;
 *   };
 * }
 *
 * // Sum of octaves, normalised back to 0-1.
 * function fbm(random, sizes) {
 *   const octaves = sizes.map((n, i) => ({ sample: lattice(random, n), gain: 1 / 2 ** i }));
 *   const total = octaves.reduce((sum, o) => sum + o.gain, 0);
 *   return (u, v) => octaves.reduce((sum, o) => sum + o.sample(u, v) * o.gain, 0) / total;
 * }
 *
 * const random = mulberry32(SEED);
 * const elevation = fbm(random, [3, 6, 12, 24]);
 * // Low-frequency field that bends the coastline, so the island isn't a bullseye.
 * const warp = fbm(random, [2, 4]);
 * const detail = fbm(random, [16, 32]);
 *
 * // Terrain bands, lowest first. An island rather than open sea: fractal noise
 * // pulled down by distance from the centre, so the coastline is ragged but the
 * // landmass always lands in the middle where the markers go.
 * const BANDS = [
 *   { until: 0.34, colour: MAP.water, level: 0 }, // deep ocean
 *   { until: 0.42, colour: MAP.water, level: 1 },
 *   { until: 0.46, colour: MAP.water, level: 2 }, // shallows
 *   { until: 0.55, colour: MAP.sand, level: 2 }, // beach
 *   { until: 0.70, colour: MAP.grass, level: 2 },
 *   { until: 0.82, colour: MAP.foliage, level: 1 }, // forest
 *   { until: 0.90, colour: MAP.dirt, level: 1 },
 *   { until: 1.00, colour: MAP.stone, level: 1 },
 *   { until: 9.99, colour: MAP.snow, level: 2 }, // peaks
 * ];
 *
 * for (let y = 0; y < size; y++) {
 *   for (let x = 0; x < size; x++) {
 *     if (!drawable[y * size + x]) continue;
 *
 *     const u = x / size;
 *     const v = y / size;
 *     // Distance from the centre, pushed in and out by a slow noise field: that
 *     // wobble is what turns a circle into a coastline with bays and headlands.
 *     const radius = Math.hypot(u - 0.5, v - 0.5) * 2 + (warp(u, v) - 0.5) * 0.62;
 *     // Falls off to sea well before the sheet edge, so the island never touches it.
 *     const island = 1 - smooth(Math.min(1, Math.max(0, (radius - 0.24) / 0.60)));
 *     const height = elevation(u, v) * 0.62 + island * 0.56 - 0.06;
 *
 *     const band = BANDS.find((b) => height < b.until) ?? BANDS[BANDS.length - 1];
 *     // Nudge the brightness with a second, finer noise field. This is what breaks
 *     // the bands into the mottled patches a real filled map has.
 *     const step = detail(u, v) > 0.52 ? 1 : detail(u, v) < 0.34 ? -1 : 0;
 *     put(x, y, shade(band.colour, Math.min(3, Math.max(0, band.level + step))));
 *   }
 * }
 *
 * const TRAIL = [
 *   [0.30, 0.66],
 *   [0.52, 0.34],
 *   [0.73, 0.60],
 * ];
 *
 * // Dashed line, Bresenham with a 4-on/4-off pattern stepped per pixel.
 * function trail(from, to, phase) {
 *   let x = Math.round(from[0] * size);
 *   let y = Math.round(from[1] * size);
 *   const x1 = Math.round(to[0] * size);
 *   const y1 = Math.round(to[1] * size);
 *   const dx = Math.abs(x1 - x);
 *   const dy = -Math.abs(y1 - y);
 *   const sx = x < x1 ? 1 : -1;
 *   const sy = y < y1 ? 1 : -1;
 *   let error = dx + dy;
 *   let step = phase;
 *
 *   for (;;) {
 *     // Drawn as a 2x2 block per step: a 1px dash all but disappears once the map
 *     // is scaled up to a few hundred CSS pixels.
 *     if (step % 8 < 4) {
 *       for (let by = 0; by < 2; by++) {
 *         for (let bx = 0; bx < 2; bx++) {
 *           const nx = x + bx;
 *           const ny = y + by;
 *           if (nx < size && ny < size && drawable[ny * size + nx]) put(nx, ny, INK);
 *         }
 *       }
 *     }
 *     if (x === x1 && y === y1) return step;
 *     const e2 = 2 * error;
 *     if (e2 >= dy) { error += dy; x += sx; }
 *     if (e2 <= dx) { error += dx; y += sy; }
 *     step++;
 *   }
 * }
 *
 * let phase = 0;
 * for (let i = 0; i < TRAIL.length - 1; i++) phase = trail(TRAIL[i], TRAIL[i + 1], phase);
 */

writeFileSync(join(assets, "map", "treasure_map.png"), encodePng(size, size, out));
console.log(`wrote map/treasure_map.png (${size}x${size})`);
