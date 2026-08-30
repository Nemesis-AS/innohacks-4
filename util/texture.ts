import type { CSSProperties } from "react";
import { BLOCK_SIZE } from "./constants";

/** Blue-black wash used to darken block textures — same family as the accordion panel's tint. */
export const WASH_RGB = "12, 12, 14";

/** `rgba()` string for the wash at the given strength (0-1). */
export function wash(darken: number) {
  return `rgba(${WASH_RGB}, ${darken})`;
}

/**
 * Background style for a tiled block texture, optionally darkened by `darken` (0-1).
 *
 * The wash is a flat gradient layered over the texture rather than a CSS filter, which
 * would create a stacking context and disturb the sections' -z-* layer order.
 */
export function tiledTexture(src: string, tileSize: number = BLOCK_SIZE, darken = 0): CSSProperties {
  return {
    backgroundImage: darken > 0 ? `linear-gradient(${wash(darken)}, ${wash(darken)}), url(${src})` : `url(${src})`,
    backgroundSize: darken > 0 ? `auto, ${tileSize}px ${tileSize}px` : `${tileSize}px ${tileSize}px`,
    backgroundRepeat: "repeat",
    imageRendering: "pixelated",
  };
}
