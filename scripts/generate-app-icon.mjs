/**
 * Renders the favicon at `app/icon.png` from `assets/logo-mark.png`.
 *
 *   node scripts/generate-app-icon.mjs
 *
 * Committed output, run by hand — same deal as the other scripts here. Re-run it
 * whenever the mark is redrawn, so the tab icon and the mark on the page stay the
 * same artwork.
 *
 * Next reads the file's own dimensions into the `sizes` attribute it emits, so
 * the output is square: a non-square icon is advertised as such and browsers
 * letterbox it themselves, usually worse than doing it here.
 *
 * The mark is taller than it is wide, and it is a composition rather than a
 * glyph — the floating diamond block and the torch are part of it. So it is fit
 * whole into the square by its longer side rather than cropped to the H, and the
 * two are separate islands, which is why the crop below is a plain alpha bounding
 * box and not the largest-island one in scripts/trim-png.mjs.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { decodePng, encodePng, resample } from "./png.mjs";

const SOURCE = "assets/logo-mark.png";
const OUT = "app/icon.png";

/**
 * Comfortably clear of the 32px the tab strip asks for at 2x, so bookmark and
 * home-screen tiles have something to work from, and still a downscale of the
 * 297px-tall mark rather than an upscale of it.
 */
const SIZE = 128;
/** Breathing room on the long side, in output pixels. */
const PADDING = 4;
/** Below this, a pixel counts as padding rather than art. */
const ALPHA_FLOOR = 8;

// --- Crop -------------------------------------------------------------------

const source = decodePng(readFileSync(SOURCE));

let left = source.width;
let top = source.height;
let right = -1;
let bottom = -1;
for (let y = 0; y < source.height; y++) {
  for (let x = 0; x < source.width; x++) {
    if (source.rgba[(y * source.width + x) * 4 + 3] <= ALPHA_FLOOR) continue;
    if (x < left) left = x;
    if (x > right) right = x;
    if (y < top) top = y;
    if (y > bottom) bottom = y;
  }
}
if (right < 0) {
  console.error(`${SOURCE} has no opaque pixels`);
  process.exit(1);
}

const cropWidth = right - left + 1;
const cropHeight = bottom - top + 1;
const cropped = { width: cropWidth, height: cropHeight, rgba: Buffer.alloc(cropWidth * cropHeight * 4) };
for (let y = 0; y < cropHeight; y++) {
  const from = ((y + top) * source.width + left) * 4;
  source.rgba.copy(cropped.rgba, y * cropWidth * 4, from, from + cropWidth * 4);
}

// --- Fit --------------------------------------------------------------------

const scale = (SIZE - PADDING * 2) / Math.max(cropWidth, cropHeight);
const markWidth = Math.max(1, Math.round(cropWidth * scale));
const markHeight = Math.max(1, Math.round(cropHeight * scale));
const mark = resample(cropped, markWidth, markHeight);

const icon = Buffer.alloc(SIZE * SIZE * 4);
const offsetX = Math.round((SIZE - markWidth) / 2);
const offsetY = Math.round((SIZE - markHeight) / 2);
for (let y = 0; y < markHeight; y++) {
  const from = y * markWidth * 4;
  mark.rgba.copy(icon, ((y + offsetY) * SIZE + offsetX) * 4, from, from + markWidth * 4);
}

const encoded = encodePng(SIZE, SIZE, icon);
writeFileSync(OUT, encoded);

console.log(
  `${SOURCE} ${source.width}x${source.height}\n` +
    `  cropped to ${cropWidth}x${cropHeight} at (${left}, ${top})\n` +
    `  -> ${OUT} ${SIZE}x${SIZE}, mark ${markWidth}x${markHeight} at (${offsetX}, ${offsetY})` +
    ` (${(encoded.length / 1024).toFixed(1)}kB)`,
);
