/**
 * Generates the pixel-art cursor PNGs in `public/cursors/` from the source art in
 * `assets/cursor/`.
 *
 * Run by hand after replacing any of the source PNGs:
 *
 *   node scripts/generate-cursors.mjs
 *
 * Deliberately NOT wired into `next build` — the outputs are committed.
 *
 * Why a build step at all, rather than pointing `cursor: url()` straight at the
 * source files:
 *
 *   1. The art is authored large (each logical pixel is a block of ~10 real ones)
 *      and `image-rendering: pixelated` does not apply to cursor images, so the
 *      art has to be shrunk to a sane cursor size with the hard edges baked in.
 *      Browsers also cap cursor bitmaps — an oversized one is silently ignored.
 *   2. The pressed variants are the same art darkened, which is cheaper to derive
 *      than to keep in sync by hand.
 *
 * Each source is reduced to its logical grid and written back out at 2x.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { decodePng, encodePng } from "./png.mjs";

const SCALE = 2;

/** How much of each channel survives in the pressed variant. */
const PRESS_DIM = 0.78;

const CURSORS = [
  { name: "arrow", source: "cursor.png" },
  { name: "hand", source: "pointer.png" },
];

// --- Downscale -------------------------------------------------------------

/**
 * Largest block size the art is drawn on: the biggest divisor of both dimensions
 * where every block is a single flat colour. Guessing this beats hard-coding it,
 * because the source PNGs get re-exported at whatever zoom the artist was at.
 */
function blockSize({ width, height, rgba }) {
  const uniform = (size) => {
    for (let y = 0; y < height; y += size) {
      for (let x = 0; x < width; x += size) {
        const at = (y * width + x) * 4;
        for (let by = 0; by < size; by++) {
          for (let bx = 0; bx < size; bx++) {
            const cell = ((y + by) * width + (x + bx)) * 4;
            for (let c = 0; c < 4; c++) {
              if (rgba[cell + c] !== rgba[at + c]) return false;
            }
          }
        }
      }
    }
    return true;
  };

  for (let size = Math.min(width, height); size > 1; size--) {
    if (width % size === 0 && height % size === 0 && uniform(size)) return size;
  }
  return 1;
}

/** Reduce to the logical grid, then blow it back up by SCALE. */
function resample(image, dim) {
  const block = blockSize(image);
  const cols = image.width / block;
  const rows = image.height / block;
  const size = { width: cols * SCALE, height: rows * SCALE };
  const out = Buffer.alloc(size.width * size.height * 4); // zero-filled: transparent

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      // Blocks are flat, so the top-left pixel is the whole block's colour.
      const from = (y * block * image.width + x * block) * 4;
      const alpha = image.rgba[from + 3];
      if (alpha === 0) continue;

      const rgb = [0, 1, 2].map((c) =>
        dim ? Math.round(image.rgba[from + c] * PRESS_DIM) : image.rgba[from + c],
      );

      for (let sy = 0; sy < SCALE; sy++) {
        for (let sx = 0; sx < SCALE; sx++) {
          const at = ((y * SCALE + sy) * size.width + (x * SCALE + sx)) * 4;
          out[at] = rgb[0];
          out[at + 1] = rgb[1];
          out[at + 2] = rgb[2];
          out[at + 3] = alpha;
        }
      }
    }
  }

  return { ...size, rgba: out, block };
}

// --- Write -----------------------------------------------------------------

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const sourceDir = join(root, "assets", "cursor");
const outDir = join(root, "public", "cursors");
mkdirSync(outDir, { recursive: true });

for (const { name, source } of CURSORS) {
  const image = decodePng(readFileSync(join(sourceDir, source)));

  for (const [suffix, dim] of [["", false], ["-press", true]]) {
    const { width, height, rgba, block } = resample(image, dim);
    writeFileSync(join(outDir, `${name}${suffix}.png`), encodePng(width, height, rgba));
    console.log(`wrote ${name}${suffix}.png (${width}x${height}, from ${source} @ ${block}px blocks)`);
  }
}
