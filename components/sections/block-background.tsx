import type { StaticImageData } from "next/image";
import { BLOCK_SIZE } from "@/util/constants";

type BlockBackgroundProps = {
  texture?: StaticImageData;
  fallbackColor: string;
  tileSize?: number;
};

/** Tiled block-texture background. Falls back to a flat color with a pixel grid until a real texture is supplied. */
export function BlockBackground({ texture, fallbackColor, tileSize = BLOCK_SIZE }: BlockBackgroundProps) {
  if (texture) {
    return (
      <div
        className="absolute inset-0 -z-10"
        style={{
          backgroundImage: `url(${texture.src})`,
          backgroundSize: `${tileSize}px ${tileSize}px`,
          backgroundRepeat: "repeat",
          imageRendering: "pixelated",
        }}
      />
    );
  }

  return (
    <div
      className="absolute inset-0 -z-10"
      style={{
        backgroundColor: fallbackColor,
        backgroundImage:
          "repeating-linear-gradient(0deg, rgba(0,0,0,0.12) 0 2px, transparent 2px), repeating-linear-gradient(90deg, rgba(0,0,0,0.12) 0 2px, transparent 2px)",
        backgroundSize: `${tileSize}px ${tileSize}px`,
      }}
    />
  );
}
