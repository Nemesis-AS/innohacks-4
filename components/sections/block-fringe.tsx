"use client";

import type { StaticImageData } from "next/image";
import { useEffect, useRef, useState } from "react";
import { BLOCK_SIZE } from "@/util/constants";
import { tiledTexture } from "@/util/texture";
import { buildColumns } from "./block-transition";

type BlockFringeProps = {
  /** Deterministic seed, so the server and client draw the same ragged edge. */
  seed: string;
  texture: StaticImageData;
  /** Which edge the solid blocks cling to. The ragged boundary faces the other way. */
  edge: "top" | "bottom";
  /** Depth of the band, in blocks. */
  rows?: number;
  tileSize?: number;
};

/**
 * A band of blocks clinging to one edge of its parent, with a Minecraft strata line —
 * eroded, never flat — where it gives way to whatever it's laid over. The same boundary
 * BlockTransition draws between two textures, except the far side here is transparency,
 * so the band covers part of what's behind it and the rest shows through.
 *
 * Column count comes from the measured width rather than a fixed number, so every tile
 * stays a true square at any viewport size — as in BlockTransition.
 */
export function BlockFringe({ seed, texture, edge, rows = 3, tileSize = BLOCK_SIZE }: BlockFringeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [columns, setColumns] = useState<boolean[][]>([]);
  const tile = tiledTexture(texture.src, tileSize);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const generate = () => {
      const { width } = el.getBoundingClientRect();
      setColumns(buildColumns(seed, Math.ceil(width / tileSize) + 1, rows));
    };

    generate();
    const observer = new ResizeObserver(generate);
    observer.observe(el);
    return () => observer.disconnect();
  }, [seed, rows, tileSize]);

  return (
    <div
      ref={containerRef}
      aria-hidden
      className={`pointer-events-none absolute inset-x-0 flex ${edge === "top" ? "top-0" : "bottom-0"}`}
      style={{ height: rows * tileSize }}
    >
      {columns.map((cells, col) => (
        <div key={col} style={{ width: tileSize, flexShrink: 0 }}>
          {/* buildColumns fills from the top; the bottom band is the same walk, flipped. */}
          {(edge === "top" ? cells : [...cells].reverse()).map((filled, row) => (
            <div key={row} style={{ width: tileSize, height: tileSize, ...(filled ? tile : undefined) }} />
          ))}
        </div>
      ))}
    </div>
  );
}
