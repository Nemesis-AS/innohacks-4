"use client";

import type { StaticImageData } from "next/image";
import { useEffect, useRef, useState } from "react";
import { mulberry32, seedFromId } from "@/components/sections/block-seam";
import { BLOCK_SIZE } from "@/util/constants";

const VOID_COLOR = "#0a0a0e";
/** Deepest point of the dome, in blocks. Enough to read as an island without a tall seam. */
const MAX_DEPTH = 5;
/** Extra blocks that can hang below the deepest columns, like crumbling rock. */
const DRIP_MAX = 1;
/** Void space beneath the island where broken-off chunks float. */
const DEBRIS_ROWS = 3;
const TOTAL_ROWS = MAX_DEPTH + DRIP_MAX + DEBRIS_ROWS;
/** Off-center peak: a steeper drop on the left, a longer taper to the right. */
const PEAK_RATIO = 0.42;
/**
 * Exponent on the dome envelope. 0.5 is a true circle, which at this width-to-depth ratio
 * holds full depth across the middle and reads flat; higher values start the taper sooner
 * and curve more. Height is set by MAX_DEPTH and is unaffected by this.
 */
const ROUNDNESS = 1;
const JITTER_CHANCE = 0.35;
const DRIP_CHANCE = 0.2;
const DEBRIS_ATTEMPTS = 3;

/**
 * Depths follow a smooth dome envelope, deepest at the peak and tapering to nothing at
 * both edges, with seeded jitter through the flanks and the occasional drip hanging off
 * the underside — an island whose bottom has crumbled unevenly, not a perfect curve.
 */
function buildDepths(id: string, count: number) {
  const random = mulberry32(seedFromId(id));
  const peak = Math.max(1, Math.floor(count * PEAK_RATIO));

  return Array.from({ length: count }, (_, col) => {
    const span = col <= peak ? peak : Math.max(1, count - 1 - peak);
    const t = (col - peak) / span;
    let depth = Math.round(MAX_DEPTH * Math.pow(Math.max(0, 1 - t * t), ROUNDNESS));

    if (depth > 0 && depth < MAX_DEPTH && random() < JITTER_CHANCE) {
      depth += random() < 0.5 ? -1 : 1;
    }
    if (depth >= MAX_DEPTH - 1 && random() < DRIP_CHANCE) {
      depth += 1 + Math.floor(random() * DRIP_MAX);
    }
    return Math.max(0, depth);
  });
}

/** Small chunks floating free below the island, the way End islands shed debris. */
function buildDebris(id: string, count: number, depths: number[]) {
  const random = mulberry32(seedFromId(`${id}-debris`));
  const chunks: { col: number; row: number; width: number }[] = [];

  for (let i = 0; i < DEBRIS_ATTEMPTS; i++) {
    const col = Math.floor(random() * count);
    const width = 1 + Math.floor(random() * 2);
    // Keep a gap so debris reads as detached rather than welded to the underside.
    const floor = (depths[col] ?? 0) + 2;
    if (floor >= TOTAL_ROWS) continue;
    chunks.push({ col, row: floor + Math.floor(random() * (TOTAL_ROWS - floor)), width });
  }
  return chunks;
}

function Block({ src }: { src: string }) {
  return (
    <div
      style={{
        width: BLOCK_SIZE,
        height: BLOCK_SIZE,
        backgroundImage: `url(${src})`,
        backgroundSize: `${BLOCK_SIZE}px ${BLOCK_SIZE}px`,
        imageRendering: "pixelated",
      }}
    />
  );
}

type FloatingIslandBaseProps = {
  texture: StaticImageData;
  id?: string;
};

/**
 * Underside of a floating island, bridging the last block section into the void.
 *
 * Column count is derived from the measured width rather than fixed, so the dome spans
 * the viewport and tapers off at both edges instead of hanging as a narrow blob beneath
 * a full-width section.
 */
export function FloatingIslandBase({ texture, id = "floating-island-base" }: FloatingIslandBaseProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [columns, setColumns] = useState<{ depths: number[]; debris: ReturnType<typeof buildDebris> }>({
    depths: [],
    debris: [],
  });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const generate = () => {
      const { width } = el.getBoundingClientRect();
      const count = Math.ceil(width / BLOCK_SIZE) + 1;
      const depths = buildDepths(id, count);
      setColumns({ depths, debris: buildDebris(id, count, depths) });
    };

    generate();
    const observer = new ResizeObserver(generate);
    observer.observe(el);
    return () => observer.disconnect();
  }, [id]);

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden"
      style={{ height: TOTAL_ROWS * BLOCK_SIZE, backgroundColor: VOID_COLOR }}
      aria-hidden
    >
      {columns.depths.map((depth, col) => (
        <div key={col} className="absolute top-0" style={{ left: col * BLOCK_SIZE, width: BLOCK_SIZE }}>
          {Array.from({ length: depth }, (_, row) => (
            <Block key={row} src={texture.src} />
          ))}
        </div>
      ))}
      {columns.debris.map((chunk, index) => (
        <div
          key={index}
          className="absolute flex"
          style={{ left: chunk.col * BLOCK_SIZE, top: chunk.row * BLOCK_SIZE }}
        >
          {Array.from({ length: chunk.width }, (_, i) => (
            <Block key={i} src={texture.src} />
          ))}
        </div>
      ))}
    </div>
  );
}
