/**
 * A minimal PNG decoder, encoder and resampler, shared by the art-generation scripts.
 *
 * Small enough not to be worth a dependency, and the alternatives (sharp, pngjs)
 * would pull a native build step into a repo that otherwise installs clean.
 *
 * Decodes non-interlaced 8-bit truecolour (with or without alpha) and
 * indexed-colour PNGs at any bit depth — between them that covers everything in
 * `assets/`, including the vanilla game textures, which ship as tiny 2- and
 * 4-bit palette images. Always hands back straight 8-bit RGBA; always writes it
 * back out the same way.
 */
import { deflateSync, inflateSync } from "node:zlib";

const SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

/** Channels per pixel, by PNG colour type. Type 3 stores one palette index. */
const CHANNELS = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 };

function paeth(a, b, c) {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  return pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
}

// --- Decode ----------------------------------------------------------------

/** @returns {{ width: number, height: number, rgba: Buffer }} */
export function decodePng(buffer) {
  if (buffer.readUInt32BE(0) !== 0x89504e47) throw new Error("not a PNG");

  let width = 0;
  let height = 0;
  let depth = 0;
  let colourType = 0;
  let palette = null;
  let alphas = null;
  const idat = [];

  let offset = 8;
  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.toString("latin1", offset + 4, offset + 8);
    const data = buffer.subarray(offset + 8, offset + 8 + length);

    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      depth = data[8];
      colourType = data[9];
      if (data[12] !== 0) throw new Error("interlaced PNGs are not supported");
    } else if (type === "PLTE") {
      palette = data;
    } else if (type === "tRNS") {
      alphas = data;
    } else if (type === "IDAT") {
      idat.push(data);
    }

    offset += length + 12; // length + type + data + crc
  }

  const channels = CHANNELS[colourType];
  if (!channels) throw new Error(`unsupported colour type ${colourType}`);
  if (colourType !== 3 && depth !== 8) throw new Error("expected 8-bit samples");
  if (colourType === 3 && !palette) throw new Error("indexed PNG with no palette");

  // Filters reference the pixel to the left, which for sub-byte depths is inside
  // the same byte — so the offset is a whole byte and `bpp` bottoms out at 1.
  const bpp = Math.max(1, Math.ceil((depth * channels) / 8));
  const stride = Math.ceil((width * channels * depth) / 8);

  const raw = inflateSync(Buffer.concat(idat));
  const bytes = Buffer.alloc(stride * height);

  // Undo the per-scanline filters. Every reference below reads from `bytes`, i.e.
  // from already-reconstructed bytes, which is what makes a single pass enough.
  let read = 0;
  for (let y = 0; y < height; y++) {
    const filter = raw[read++];
    for (let x = 0; x < stride; x++) {
      const value = raw[read++];
      const left = x >= bpp ? bytes[y * stride + x - bpp] : 0;
      const up = y > 0 ? bytes[(y - 1) * stride + x] : 0;
      const upLeft = x >= bpp && y > 0 ? bytes[(y - 1) * stride + x - bpp] : 0;

      let restored;
      switch (filter) {
        case 0: restored = value; break;
        case 1: restored = value + left; break;
        case 2: restored = value + up; break;
        case 3: restored = value + ((left + up) >> 1); break;
        case 4: restored = value + paeth(left, up, upLeft); break;
        default: throw new Error(`unknown filter ${filter}`);
      }
      bytes[y * stride + x] = restored & 0xff;
    }
  }

  const rgba = Buffer.alloc(width * height * 4);
  const perByte = 8 / depth;
  const mask = (1 << depth) - 1;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const at = (y * width + x) * 4;

      if (colourType === 3) {
        const index =
          depth === 8
            ? bytes[y * stride + x]
            : (bytes[y * stride + Math.floor(x / perByte)] >> (8 - depth - (x % perByte) * depth)) & mask;
        rgba[at] = palette[index * 3];
        rgba[at + 1] = palette[index * 3 + 1];
        rgba[at + 2] = palette[index * 3 + 2];
        // tRNS on an indexed image is a per-index alpha table, and it may be
        // shorter than the palette — anything past its end is fully opaque.
        rgba[at + 3] = alphas && index < alphas.length ? alphas[index] : 255;
      } else {
        const from = y * stride + x * channels;
        rgba[at] = bytes[from];
        rgba[at + 1] = bytes[from + (channels >= 3 ? 1 : 0)];
        rgba[at + 2] = bytes[from + (channels >= 3 ? 2 : 0)];
        rgba[at + 3] = channels === 4 ? bytes[from + 3] : channels === 2 ? bytes[from + 1] : 255;
      }
    }
  }

  return { width, height, rgba };
}

// --- Encode ----------------------------------------------------------------
// 8-bit RGBA, one IDAT, no filtering.

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

export function encodePng(width, height, rgba) {
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
    SIGNATURE,
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// --- Resample --------------------------------------------------------------

/**
 * Box filter to an exact size, averaging in premultiplied alpha.
 *
 * Averaging straight RGBA drags the colour of the transparent pixels into the
 * edge, which on a transparent-black canvas means a dark halo all the way round.
 *
 * @returns {{ width: number, height: number, rgba: Buffer }}
 */
export function resample(image, width, height) {
  if (image.width === width && image.height === height) return image;

  const rgba = Buffer.alloc(width * height * 4);

  for (let y = 0; y < height; y++) {
    const top = Math.floor((y * image.height) / height);
    const bottom = Math.max(top + 1, Math.floor(((y + 1) * image.height) / height));

    for (let x = 0; x < width; x++) {
      const left = Math.floor((x * image.width) / width);
      const right = Math.max(left + 1, Math.floor(((x + 1) * image.width) / width));

      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;
      let count = 0;

      for (let sy = top; sy < bottom; sy++) {
        for (let sx = left; sx < right; sx++) {
          const at = (sy * image.width + sx) * 4;
          const alpha = image.rgba[at + 3];
          r += image.rgba[at] * alpha;
          g += image.rgba[at + 1] * alpha;
          b += image.rgba[at + 2] * alpha;
          a += alpha;
          count++;
        }
      }

      const at = (y * width + x) * 4;
      if (a === 0) continue; // leave it transparent black
      rgba[at] = Math.round(r / a);
      rgba[at + 1] = Math.round(g / a);
      rgba[at + 2] = Math.round(b / a);
      rgba[at + 3] = Math.round(a / count);
    }
  }

  return { width, height, rgba };
}
