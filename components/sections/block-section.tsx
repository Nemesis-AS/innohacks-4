import type { StaticImageData } from "next/image";
import type { ReactNode } from "react";
import { BlockBackground } from "./block-background";
import { BlockSeam, seedFromId } from "./block-seam";
import { OreOverlay } from "./ore-overlay";

const PIXEL_FONT = "var(--font-minecraft), ui-monospace, 'Courier New', monospace";

type BlockSectionProps = {
  id: string;
  eyebrow?: string;
  title?: string;
  texture?: StaticImageData;
  fallbackColor: string;
  tileSize?: number;
  textColor?: string;
  oreTextures?: StaticImageData[];
  /** Disable the 1-block jagged seam, e.g. when a dedicated BlockTransition already handles this boundary. */
  seam?: boolean;
  /** "center" stacks eyebrow/title/children in a narrow centered column (default). "left" widens the column and left-aligns content, for layouts that build their own internal grid. */
  align?: "center" | "left";
  /** Override the default max-width column (max-w-2xl centered / max-w-5xl left), e.g. for a wide card grid. */
  maxWidthClassName?: string;
  children?: ReactNode;
};

/** Full-screen page section with a tiled block-texture (or placeholder) background. */
export function BlockSection({
  id,
  eyebrow,
  title,
  texture,
  fallbackColor,
  tileSize,
  textColor = "#f5f5f0",
  oreTextures,
  seam = true,
  align = "center",
  maxWidthClassName,
  children,
}: BlockSectionProps) {
  const isLeft = align === "left";

  return (
    <section id={id} className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-24">
      <BlockBackground texture={texture} fallbackColor={fallbackColor} tileSize={tileSize} />
      {oreTextures && oreTextures.length > 0 && (
        <OreOverlay textures={oreTextures} seed={seedFromId(id)} tileSize={tileSize} />
      )}
      {seam && <BlockSeam seed={seedFromId(id)} color={fallbackColor} textureSrc={texture?.src} />}
      <div
        className={`relative z-10 flex w-full flex-col gap-4 ${
          maxWidthClassName ?? (isLeft ? "max-w-5xl" : "max-w-2xl")
        } ${isLeft ? "items-stretch text-left" : "items-center text-center"}`}
      >
        {title && (
          <h2
            className="text-3xl uppercase md:text-5xl"
            style={{ color: textColor, fontFamily: PIXEL_FONT, textShadow: "3px 3px 0 rgba(0,0,0,0.35)" }}
          >
            {title}
          </h2>
        )}
        {children}
      </div>
    </section>
  );
}
