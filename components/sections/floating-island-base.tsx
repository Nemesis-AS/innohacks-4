import type { StaticImageData } from "next/image";

const BLOCK_SIZE = 64;
const VOID_COLOR = "#0a0a0e";
const ROWS = 3;
const COLUMN_COUNT = 24; // fixed island width — the whole curve, edge to edge, should stay on screen
const PEAK_COLUMN = 8; // off-center peak — shorter, steeper drop on the left, longer taper on the right

// Smooth dome curve, deepest at PEAK_COLUMN: an asymmetric taper, not a mirrored arc.
function depthForColumn(col: number) {
  const span = col <= PEAK_COLUMN ? PEAK_COLUMN : COLUMN_COUNT - 1 - PEAK_COLUMN;
  const t = span === 0 ? 0 : (col - PEAK_COLUMN) / span;
  const curve = Math.sqrt(Math.max(0, 1 - t * t));
  return Math.round(ROWS * curve);
}

type FloatingIslandBaseProps = {
  texture: StaticImageData;
};

/**
 * Underside of a floating island: a single smooth curve — deepest in the middle,
 * tapering to nothing at the edges — instead of a flat block edge.
 */
export function FloatingIslandBase({ texture }: FloatingIslandBaseProps) {
  return (
    <div
      className="relative flex w-full justify-center overflow-hidden"
      style={{ height: ROWS * BLOCK_SIZE, backgroundColor: VOID_COLOR }}
    >
      {Array.from({ length: COLUMN_COUNT }, (_, col) => {
        const depth = depthForColumn(col);
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
