import type { CSSProperties } from "react";
import { tiledTexture, wash } from "@/util/texture";

export function mulberry32(seed: number) {
  return function random() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Deterministic seed from a string, so server and client render the same jagged pattern. */
export function seedFromId(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return hash;
}

const COLUMNS = 32;
const BLOCK_SIZE = 28;
const POKE_CHANCE = 0.4;

type BlockSeamProps = {
  seed: number;
  color: string;
  textureSrc?: string;
  /** Match the parent section's dark wash — the seam sits above the section's scrim, so it needs its own. */
  darken?: number;
};

/**
 * A jagged row of blocks poking up from this section into the one above it —
 * Minecraft terrain never has a flat seam between layers, a few blocks always
 * stick up unevenly. Place at the top of a section, overlapping upward by
 * one block height.
 */
export function BlockSeam({ seed, color, textureSrc, darken = 0 }: BlockSeamProps) {
  const random = mulberry32(seed);
  const pokes = Array.from({ length: COLUMNS }, () => random() < POKE_CHANCE);
  const tile: CSSProperties = textureSrc
    ? { ...tiledTexture(textureSrc, BLOCK_SIZE, darken), backgroundPosition: darken > 0 ? "top, bottom" : "bottom" }
    : {
        backgroundColor: color,
        backgroundImage: darken > 0 ? `linear-gradient(${wash(darken)}, ${wash(darken)})` : undefined,
      };

  return (
    <div
      className="absolute inset-x-0 z-0 flex items-end pointer-events-none"
      style={{ top: -BLOCK_SIZE, height: BLOCK_SIZE }}
    >
      {pokes.map((poke, i) => (
        <div key={i} style={{ flex: "1 0 auto", height: poke ? BLOCK_SIZE : 0, ...tile }} />
      ))}
    </div>
  );
}
