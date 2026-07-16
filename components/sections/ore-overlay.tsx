"use client";

import type { StaticImageData } from "next/image";
import { useEffect, useRef, useState } from "react";
import { BLOCK_SIZE } from "@/util/constants";

function mulberry32(seed: number) {
  return function random() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type OreTile = { x: number; y: number; src: string };

type OreOverlayProps = {
  textures: StaticImageData[];
  seed: number;
  tileSize?: number;
  /** Approximate fraction of tiles covered by ore — keep low so it reads as sparse veins, not noise. */
  density?: number;
};

/** Scatters small clustered patches of ore textures over a tiled block background, like Minecraft ore veins. */
export function OreOverlay({ textures, seed, tileSize = BLOCK_SIZE, density = 0.035 }: OreOverlayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tiles, setTiles] = useState<OreTile[]>([]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || textures.length === 0) return;

    const generate = () => {
      const { width, height } = el.getBoundingClientRect();
      const cols = Math.max(1, Math.ceil(width / tileSize));
      const rows = Math.max(1, Math.ceil(height / tileSize));
      const totalTiles = cols * rows;
      const targetCovered = Math.round(totalTiles * density);

      const random = mulberry32(seed);
      const occupied = new Set<string>();
      const result: OreTile[] = [];
      let attempts = 0;

      while (result.length < targetCovered && attempts < targetCovered * 20) {
        attempts++;
        let cx = Math.floor(random() * cols);
        let cy = Math.floor(random() * rows);
        const clusterSize = 2 + Math.floor(random() * 3); // 2-4 tiles per vein
        const texture = textures[Math.floor(random() * textures.length)];

        for (let i = 0; i < clusterSize && result.length < targetCovered; i++) {
          const key = `${cx},${cy}`;
          if (cx >= 0 && cx < cols && cy >= 0 && cy < rows && !occupied.has(key)) {
            occupied.add(key);
            result.push({ x: cx, y: cy, src: texture.src });
          }
          const dir = Math.floor(random() * 4);
          if (dir === 0) cx++;
          else if (dir === 1) cx--;
          else if (dir === 2) cy++;
          else cy--;
        }
      }

      setTiles(result);
    };

    generate();
    const observer = new ResizeObserver(generate);
    observer.observe(el);
    return () => observer.disconnect();
  }, [textures, seed, tileSize, density]);

  return (
    <div ref={containerRef} className="absolute inset-0 -z-[5] overflow-hidden" aria-hidden>
      {tiles.map((tile) => (
        <div
          key={`${tile.x}-${tile.y}`}
          className="absolute"
          style={{
            left: tile.x * tileSize,
            top: tile.y * tileSize,
            width: tileSize,
            height: tileSize,
            backgroundImage: `url(${tile.src})`,
            backgroundSize: `${tileSize}px ${tileSize}px`,
            imageRendering: "pixelated",
          }}
        />
      ))}
    </div>
  );
}
