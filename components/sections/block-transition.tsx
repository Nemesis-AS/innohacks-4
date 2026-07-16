"use client";

import type { StaticImageData } from "next/image";
import { useEffect, useRef, useState } from "react";
import { BLOCK_SIZE } from "@/util/constants";
import { mulberry32, seedFromId } from "./block-seam";

const ROWS = 3;
const SPECKLE_CHANCE = 0.12;

type BlockTransitionProps = {
  id: string;
  top: StaticImageData;
  bottom: StaticImageData;
};

function buildColumns(id: string, count: number) {
  const random = mulberry32(seedFromId(id));
  let level = Math.round(random() * ROWS);

  return Array.from({ length: count }, () => {
    level = Math.min(ROWS, Math.max(0, level + Math.floor(random() * 3) - 1));
    const boundary = level;
    return Array.from({ length: ROWS }, (_, row) => {
      let useTop = row < boundary;
      if (Math.abs(row - boundary) <= 1 && random() < SPECKLE_CHANCE) useTop = !useTop;
      return useTop;
    });
  });
}

/**
 * Organic 3-block-tall strata blend between two sections, like a Minecraft biome/layer
 * boundary: a smooth random-walk line decides where "top" gives way to "bottom" per
 * column, with the odd stray block flipped near the boundary for an eroded look.
 *
 * Column count is derived from the measured width (width / BLOCK_SIZE) rather than a
 * fixed number, so every tile stays a true 32x32 square at any viewport size.
 */
export function BlockTransition({ id, top, bottom }: BlockTransitionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [columns, setColumns] = useState<boolean[][]>([]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const generate = () => {
      const { width } = el.getBoundingClientRect();
      const count = Math.ceil(width / BLOCK_SIZE) + 1;
      setColumns(buildColumns(id, count));
    };

    generate();
    const observer = new ResizeObserver(generate);
    observer.observe(el);
    return () => observer.disconnect();
  }, [id]);

  return (
    <div
      ref={containerRef}
      className="relative z-0 flex w-full overflow-hidden"
      style={{ height: ROWS * BLOCK_SIZE }}
      aria-hidden
    >
      {columns.map((rows, col) => (
        <div key={col} style={{ width: BLOCK_SIZE, flexShrink: 0 }}>
          {rows.map((useTop, row) => {
            const texture = useTop ? top : bottom;
            return (
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
            );
          })}
        </div>
      ))}
    </div>
  );
}
