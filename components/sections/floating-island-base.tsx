import type { StaticImageData } from "next/image";
import { mulberry32, seedFromId } from "@/components/sections/block-seam";
import { BLOCK_SIZE } from "@/util/constants";

const VOID_COLOR = "#0a0a0e";
const ROWS = 3;
const COLUMN_COUNT = 24; // fixed island width — the whole curve, edge to edge, should stay on screen
const PEAK_COLUMN = 8; // off-center peak — shorter, steeper drop on the left, longer taper on the right
const JITTER_CHANCE = 0.4;

// Smooth dome envelope, deepest at PEAK_COLUMN: an asymmetric taper, not a mirrored arc.
function envelopeForColumn(col: number) {
  const span = col <= PEAK_COLUMN ? PEAK_COLUMN : COLUMN_COUNT - 1 - PEAK_COLUMN;
  const t = span === 0 ? 0 : (col - PEAK_COLUMN) / span;
  const curve = Math.sqrt(Math.max(0, 1 - t * t));
  return ROWS * curve;
}

// Depths follow the smooth dome envelope but a seeded jitter nudges columns in the
// tapering flanks up or down a block, like an island whose underside has crumbled
// unevenly rather than a mathematically perfect dome.
function buildDepths(id: string) {
  const random = mulberry32(seedFromId(id));
  return Array.from({ length: COLUMN_COUNT }, (_, col) => {
    let depth = Math.round(envelopeForColumn(col));
    if (depth > 0 && depth < ROWS && random() < JITTER_CHANCE) {
      depth += random() < 0.5 ? -1 : 1;
    }
    return Math.min(ROWS, Math.max(0, depth));
  });
}

type FloatingIslandBaseProps = {
  texture: StaticImageData;
  id?: string;
};

/**
 * Underside of a floating island: a smooth dome, deepest in the middle and tapering
 * to nothing at the edges, with a touch of seeded jitter so it reads as crumbled rock
 * rather than a perfect geometric curve.
 */
export function FloatingIslandBase({ texture, id = "floating-island-base" }: FloatingIslandBaseProps) {
  const depths = buildDepths(id);

  return (
    <div
      className="relative flex w-full justify-center overflow-hidden"
      style={{ height: ROWS * BLOCK_SIZE, backgroundColor: VOID_COLOR }}
    >
      {depths.map((depth, col) => {
        return (
          <div key={col} style={{ width: BLOCK_SIZE, flexShrink: 0 }}>
            {Array.from({ length: depth }, (_, row) => (
              <div
                key={row}
                style={{
                  width: BLOCK_SIZE,
                  height: BLOCK_SIZE,
                  backgroundImage: `url(${texture.src})`,
                  backgroundSize: `${BLOCK_SIZE}px ${BLOCK_SIZE}px`,
                  imageRendering: "pixelated",
                }}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}
