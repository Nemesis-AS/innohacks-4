"use client";

import type { StaticImageData } from "next/image";
import { useEffect, useRef, useState } from "react";
import { mulberry32, seedFromId } from "@/components/sections/block-seam";
import { BLOCK_SIZE } from "@/util/constants";

const MAX_ROWS = 4;
const MIN_ROWS = 2;
const MID_ROWS = (MAX_ROWS + MIN_ROWS) / 2;
const AMPLITUDE = (MAX_ROWS - MIN_ROWS) / 2;

// Each column is exactly one grass tile on top of one-or-more dirt tiles below it — never
// two grass tiles stacked, since the grass texture already bakes in its own dirt body and
// stacking a second copy underneath would print a stray green stripe mid-column.
//
// Heights follow two overlaid sine waves (slightly different frequency/phase per `id`)
// rather than an independent per-column random walk, so the surface rolls in broad, smooth
// hills with plateaus instead of flickering up and down every column.
function buildColumns(id: string, count: number) {
  const random = mulberry32(seedFromId(id));
  const freqA = 0.05 + random() * 0.03;
  const freqB = 0.1 + random() * 0.05;
  const phaseA = random() * Math.PI * 2;
  const phaseB = random() * Math.PI * 2;

  return Array.from({ length: count }, (_, col) => {
    const wave = Math.sin(col * freqA + phaseA) * 0.65 + Math.sin(col * freqB + phaseB) * 0.35;
    const height = Math.round(MID_ROWS + wave * AMPLITUDE);
    return Math.min(MAX_ROWS, Math.max(MIN_ROWS, height));
  });
}

type GroundProps = {
  id: string;
  grass: StaticImageData;
  dirt: StaticImageData;
};

/**
 * Ground the hero scene stands on: a jagged grass/dirt seam, like Minecraft terrain
 * never having a perfectly flat layer boundary, instead of two flat stacked strips.
 */
export function Ground({ id, grass, dirt }: GroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [columns, setColumns] = useState<number[]>([]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const generate = () => {
      const { width } = el.getBoundingClientRect();
      setColumns(buildColumns(id, Math.ceil(width / BLOCK_SIZE) + 1));
    };

    generate();
    const observer = new ResizeObserver(generate);
    observer.observe(el);
    return () => observer.disconnect();
  }, [id]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-x-0 bottom-0 flex items-end"
      style={{ height: MAX_ROWS * BLOCK_SIZE }}
    >
      {columns.map((height, col) => (
        <div key={col} className="flex flex-col" style={{ width: BLOCK_SIZE, flexShrink: 0 }}>
          {Array.from({ length: height }, (_, row) => {
            const texture = row === 0 ? grass : dirt;
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
