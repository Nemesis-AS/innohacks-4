/**
 * Cuts the two chain strips the timeline hangs off `assets/chain.png`.
 *
 *   node scripts/generate-chain-strips.mjs
 *
 * Committed outputs, run by hand — same deal as the other scripts here.
 *
 * The vanilla texture is a 16x16 sheet with the chain living in its first six
 * columns and the rest left transparent (the block model wraps the strip around
 * two crossed quads, so it only ever needs the one strip). As a CSS background
 * that padding is a nuisance: `repeat-y` on the raw sheet leaves a 10px transparent
 * gutter beside every link, so the element has to be 16 texels wide to show 6
 * texels of chain, and anything positioned against its edges is 10 texels out.
 *
 * So `chain_strip.png` is just those six columns, and `chain_strip_rotated.png`
 * is the same strip turned a quarter turn for the horizontal rod the banners hang
 * from. Both still tile on their long axis, which is what the links repeat along.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { decodePng, encodePng } from "./png.mjs";

const SOURCE = "assets/chain.png";
const STRIP = "assets/chain_strip.png";
const ROTATED = "assets/chain_strip_rotated.png";

const source = decodePng(readFileSync(SOURCE));

/** Columns with anything in them, i.e. the strip and nothing else. */
function occupiedColumns({ width, height, rgba }) {
  let left = width;
  let right = -1;
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      if (rgba[(y * width + x) * 4 + 3] === 0) continue;
      if (x < left) left = x;
      if (x > right) right = x;
      break;
    }
  }
  return { left, right };
}

const { left, right } = occupiedColumns(source);
if (right < left) throw new Error(`${SOURCE} is empty`);

const width = right - left + 1;
const height = source.height;
const strip = Buffer.alloc(width * height * 4);
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const from = (y * source.width + x + left) * 4;
    source.rgba.copy(strip, (y * width + x) * 4, from, from + 4);
  }
}

// Quarter turn clockwise: the strip's top edge becomes the turned copy's right
// edge, so a chain that ran downwards now runs left to right.
const rotated = Buffer.alloc(width * height * 4);
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const from = (y * width + x) * 4;
    const to = (x * height + (height - 1 - y)) * 4;
    strip.copy(rotated, to, from, from + 4);
  }
}

writeFileSync(STRIP, encodePng(width, height, strip));
writeFileSync(ROTATED, encodePng(height, width, rotated));

console.log(
  `${SOURCE} ${source.width}x${source.height}\n` +
    `  -> ${STRIP} ${width}x${height} (columns ${left}-${right})\n` +
    `  -> ${ROTATED} ${height}x${width}`,
);
