/**
 * Crops the transparent padding off a PNG, and optionally shrinks it.
 *
 * Run by hand after dropping a new render into `assets/`:
 *
 *   node scripts/trim-png.mjs assets/minecart.png --max-width 384
 *
 * Deliberately NOT wired into `next build` — like the other scripts here, the
 * outputs are committed. Writes in place unless `--out` is given.
 *
 * Renders exported from a 3D viewport arrive on the viewport's canvas, not the
 * subject's: `assets/minecart.png` came in at 2559x1439 with the cart occupying
 * about a fifth of it. That padding is worth removing rather than dialling out
 * in CSS — an element positioned by its own box is far easier to reason about
 * when the box is the art.
 *
 * Two wrinkles a plain alpha bounding box gets wrong, hence this script:
 *
 *   1. Exports often carry a stray speck or two of leftover geometry far from
 *      the subject, which pins the bounding box to nearly the full canvas. So
 *      the crop is taken from the largest connected run of opaque pixels, and
 *      everything outside it is cleared.
 *   2. Downscaling has to average in premultiplied alpha. Averaging straight
 *      RGBA drags the colour of the transparent pixels into the edge, which on
 *      a transparent-black canvas means a dark halo all the way round.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { decodePng, encodePng, resample } from "./png.mjs";

/** Below this, a pixel counts as padding rather than art. */
const ALPHA_FLOOR = 8;

// --- Crop ------------------------------------------------------------------

/**
 * Flood-fills from every opaque pixel and keeps the biggest island, returning its
 * bounds plus a mask of the pixels that belong to it.
 *
 * Iterative on an explicit stack: the minecart's island is ~350k pixels, deep
 * enough that recursion would blow the call stack.
 */
function largestIsland({ width, height, rgba }) {
  const opaque = (i) => rgba[i * 4 + 3] > ALPHA_FLOOR;
  const seen = new Uint8Array(width * height);
  const keep = new Uint8Array(width * height);
  let best = { size: 0, left: 0, top: 0, right: 0, bottom: 0 };
  let islands = 0;

  for (let start = 0; start < width * height; start++) {
    if (seen[start] || !opaque(start)) continue;
    islands++;

    const island = [];
    const stack = [start];
    seen[start] = 1;
    let left = width;
    let top = height;
    let right = 0;
    let bottom = 0;

    const visit = (at) => {
      if (seen[at] || !opaque(at)) return;
      seen[at] = 1;
      stack.push(at);
    };

    while (stack.length > 0) {
      const at = stack.pop();
      island.push(at);
      const x = at % width;
      const y = (at - x) / width;
      if (x < left) left = x;
      if (x > right) right = x;
      if (y < top) top = y;
      if (y > bottom) bottom = y;

      if (x > 0) visit(at - 1);
      if (x < width - 1) visit(at + 1);
      if (y > 0) visit(at - width);
      if (y < height - 1) visit(at + width);
    }

    if (island.length > best.size) {
      best = { size: island.length, left, top, right, bottom };
      keep.fill(0);
      for (const at of island) keep[at] = 1;
    }
  }

  return { ...best, keep, islands };
}

function crop(image, bounds) {
  const width = bounds.right - bounds.left + 1;
  const height = bounds.bottom - bounds.top + 1;
  const rgba = Buffer.alloc(width * height * 4);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const from = (y + bounds.top) * image.width + (x + bounds.left);
      // Specks outside the kept island fall away with the padding.
      if (!bounds.keep[from]) continue;
      image.rgba.copy(rgba, (y * width + x) * 4, from * 4, from * 4 + 4);
    }
  }

  return { width, height, rgba };
}

// --- Downscale -------------------------------------------------------------

/** Shrinks to fit `maxWidth`, keeping the aspect ratio. Never enlarges. */
function downscale(image, maxWidth) {
  if (image.width <= maxWidth) return image;
  const height = Math.max(1, Math.round((image.height * maxWidth) / image.width));
  return resample(image, maxWidth, height);
}

// --- Run -------------------------------------------------------------------

const args = process.argv.slice(2);
const flags = {};
const positional = [];
for (let i = 0; i < args.length; i++) {
  if (args[i].startsWith("--")) flags[args[i]] = args[++i];
  else positional.push(args[i]);
}
const flag = (name) => flags[name] ?? null;

const source = positional[0];
if (!source) {
  console.error("usage: node scripts/trim-png.mjs <file.png> [--max-width N] [--out file.png]");
  process.exit(1);
}

const out = flag("--out") ?? source;
const maxWidth = flag("--max-width") ? Number(flag("--max-width")) : null;

const before = readFileSync(source);
const image = decodePng(before);
const bounds = largestIsland(image);
if (bounds.size === 0) {
  console.error(`${source} has no opaque pixels`);
  process.exit(1);
}

const cropped = crop(image, bounds);
const final = maxWidth ? downscale(cropped, maxWidth) : cropped;
const encoded = encodePng(final.width, final.height, final.rgba);
writeFileSync(out, encoded);

const kb = (bytes) => `${(bytes / 1024).toFixed(1)}kB`;
console.log(
  `${source} -> ${out}\n` +
    `  ${image.width}x${image.height} ${kb(before.length)}` +
    ` -> ${final.width}x${final.height} ${kb(encoded.length)}\n` +
    `  kept the ${bounds.size}px island at (${bounds.left}, ${bounds.top}), dropped ${bounds.islands - 1} other`,
);
