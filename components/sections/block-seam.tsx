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
};

/**
 * A jagged row of blocks poking up from this section into the one above it —
 * Minecraft terrain never has a flat seam between layers, a few blocks always
 * stick up unevenly. Place at the top of a section, overlapping upward by
 * one block height.
 */
export function BlockSeam({ seed, color, textureSrc }: BlockSeamProps) {
  const random = mulberry32(seed);
  const pokes = Array.from({ length: COLUMNS }, () => random() < POKE_CHANCE);

  return (
    <div
      className="absolute inset-x-0 z-0 flex items-end pointer-events-none"
      style={{ top: -BLOCK_SIZE, height: BLOCK_SIZE }}
    >
      {pokes.map((poke, i) => (
        <div
          key={i}
          style={{
            flex: "1 0 auto",
            height: poke ? BLOCK_SIZE : 0,
            backgroundImage: textureSrc ? `url(${textureSrc})` : undefined,
            backgroundColor: textureSrc ? undefined : color,
            backgroundSize: `${BLOCK_SIZE}px ${BLOCK_SIZE}px`,
            backgroundPosition: "bottom",
            imageRendering: "pixelated",
          }}
        />
      ))}
    </div>
  );
}
