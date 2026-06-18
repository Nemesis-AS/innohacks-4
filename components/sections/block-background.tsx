import type { StaticImageData } from "next/image";

type BlockBackgroundProps = {
  texture?: StaticImageData;
  fallbackColor: string;
  tileSize?: number;
};

/** Tiled block-texture background. Falls back to a flat color with a pixel grid until a real texture is supplied. */
export function BlockBackground({ texture, fallbackColor, tileSize = 64 }: BlockBackgroundProps) {
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
