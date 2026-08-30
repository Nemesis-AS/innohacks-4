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
import { deflateSync, inflateSync } from "node:zlib";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SCALE = 2;

/** How much of each channel survives in the pressed variant. */
const PRESS_DIM = 0.78;

const CURSORS = [
  { name: "arrow", source: "cursor.png" },
  { name: "hand", source: "pointer.png" },
];

// --- Minimal PNG decoder ---------------------------------------------------
// Only handles what the source art is: 8-bit RGBA, no interlacing.

function decodePng(buffer) {
  if (buffer.readUInt32BE(0) !== 0x89504e47) throw new Error("not a PNG");

  let offset = 8;
  let width = 0;
  let height = 0;
  const idat = [];

  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.toString("latin1", offset + 4, offset + 8);
    const data = buffer.subarray(offset + 8, offset + 8 + length);

    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      if (data[8] !== 8 || data[9] !== 6) throw new Error("expected 8-bit RGBA");
      if (data[12] !== 0) throw new Error("interlaced PNGs are not supported");
    } else if (type === "IDAT") {
      idat.push(data);
    }

    offset += length + 12; // length + type + data + crc
  }

  const raw = inflateSync(Buffer.concat(idat));
  const stride = width * 4;
  const rgba = Buffer.alloc(stride * height);

  // Undo the per-scanline filters. Every reference below reads from `rgba`, i.e.
  // from already-reconstructed bytes, which is what makes a single pass enough.
  const paeth = (a, b, c) => {
    const p = a + b - c;
    const pa = Math.abs(p - a);
    const pb = Math.abs(p - b);
    const pc = Math.abs(p - c);
    return pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
  };

  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)];
    for (let x = 0; x < stride; x++) {
      const value = raw[y * (stride + 1) + 1 + x];
      const left = x >= 4 ? rgba[y * stride + x - 4] : 0;
      const up = y > 0 ? rgba[(y - 1) * stride + x] : 0;
      const upLeft = x >= 4 && y > 0 ? rgba[(y - 1) * stride + x - 4] : 0;

      let restored;
      switch (filter) {
        case 0: restored = value; break;
        case 1: restored = value + left; break;
        case 2: restored = value + up; break;
        case 3: restored = value + ((left + up) >> 1); break;
        case 4: restored = value + paeth(left, up, upLeft); break;
        default: throw new Error(`unknown filter ${filter}`);
      }
      rgba[y * stride + x] = restored & 0xff;
    }
  }

  return { width, height, rgba };
}

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

// --- Minimal PNG encoder ---------------------------------------------------
// 8-bit RGBA, one IDAT, no filtering. Small enough not to be worth a dependency.

const CRC_TABLE = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  return table;
})();

function crc32(buf) {
  let c = -1;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}

function chunk(type, data) {
  const body = Buffer.concat([Buffer.from(type, "latin1"), data]);
  const out = Buffer.alloc(body.length + 8);
  out.writeUInt32BE(data.length, 0);
  body.copy(out, 4);
  out.writeUInt32BE(crc32(body), body.length + 4);
  return out;
}

function encodePng(width, height, rgba) {
  const stride = width * 4 + 1; // each scanline is prefixed with its filter byte
  const raw = Buffer.alloc(stride * height);
  for (let y = 0; y < height; y++) {
    raw[y * stride] = 0; // filter type 0 (none)
    rgba.copy(raw, y * stride + 1, y * width * 4, (y + 1) * width * 4);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // colour type: truecolour with alpha

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
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
