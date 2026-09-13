import type { StaticImageData } from "next/image";
import type { ReactNode } from "react";
import { wash } from "@/util/texture";
import { BlockBackground } from "./block-background";
import { BlockSeam, seedFromId } from "./block-seam";
import { OreOverlay } from "./ore-overlay";

import {
  EMBOSS_LIGHT,
  PIXEL_FONT,
  SHADOW_HEADING,
  SHADOW_SMALL,
} from "@/util/ui";
import Image from "next/image";
import { div } from "motion/react-client";

/** Rough perceived-lightness test so dark ink (FAQ's endstone) gets a light emboss, not a dark drop. */
function isDarkInk(hex: string) {
  const m = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!m) return false;
  const n = parseInt(m[1], 16);
  const luma =
    0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255);
  return luma < 128;
}

type BlockSectionProps = {
  id: string;
  eyebrow?: string;
  title?: string;
  texture?: StaticImageData;
  fallbackColor: string;
  tileSize?: number;
  textColor?: string;
  oreTextures?: StaticImageData[];
  /** Full-bleed cover artwork behind the section, in place of the tiled `texture`. */
  image?: StaticImageData;
  /** Dark wash (0-1) over `image` only, leaving the edge band's texture at full brightness. */
  imageTint?: number;
  /** With `image`, how many blocks of `texture` hold the top and bottom edges before fading out. */
  edgeBandBlocks?: number;
  /** With `image`, cutouts pinned to the bottom corners in front of it — the render's near plane, kept sharp. */
  flanks?: { left: StaticImageData; right: StaticImageData };
  /** Strength (0-1) of a dark wash over the background, for sections meant to read as deeper underground. */
  darken?: number;
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
  image,
  imageTint,
  edgeBandBlocks,
  flanks,
  darken = 0,
  seam = true,
  align = "center",
  maxWidthClassName,
  children,
  // woodenSeam = true,
}: BlockSectionProps) {
  const isLeft = align === "left";

  return (
    <section
      id={id}
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-24"
    >
      {/* {woodenSeam && (
        <div
          className="absolute top-0 z-10 pointer-events-none h-32 -translate-y-1/2 w-full bg-repeat-x bg-contain"
          style={{
            backgroundImage: `url("${WoodenSeam.src}")`
          }}
        >
        </div>
      )} */}
      <BlockBackground
        id={id}
        texture={texture}
        fallbackColor={fallbackColor}
        tileSize={tileSize}
        image={image}
        imageTint={imageTint}
        edgeBandBlocks={edgeBandBlocks}
        flanks={flanks}
      />
      {oreTextures && oreTextures.length > 0 && (
        <OreOverlay
          textures={oreTextures}
          seed={seedFromId(id)}
          tileSize={tileSize}
        />
      )}
      {darken > 0 && (
        // Above the ore veins so texture and ore darken together — tinting only the
        // background would leave the ore tiles at full brightness, floating on top.
        <div
          className="absolute inset-0 -z-[4]"
          style={{ backgroundColor: wash(darken) }}
          aria-hidden
        />
      )}
      {seam && (
        <BlockSeam
          seed={seedFromId(id)}
          color={fallbackColor}
          textureSrc={texture?.src}
          darken={darken}
        />
      )}
      <div
        className={`relative z-10 flex w-full flex-col gap-4 ${
          maxWidthClassName ?? (isLeft ? "max-w-5xl" : "max-w-2xl")
        } ${isLeft ? "items-stretch text-left" : "items-center text-center"}`}
      >
        {eyebrow && (
          <p
            className="text-xs uppercase tracking-[0.15em] opacity-80 sm:text-sm"
            style={{
              color: textColor,
              fontFamily: PIXEL_FONT,
              textShadow: isDarkInk(textColor) ? EMBOSS_LIGHT : SHADOW_SMALL,
            }}
          >
            {eyebrow}
          </p>
        )}
        {title && (
          <h2
            className="text-3xl uppercase md:text-5xl"
            style={{
              color: textColor,
              fontFamily: PIXEL_FONT,
              textShadow: isDarkInk(textColor) ? EMBOSS_LIGHT : SHADOW_HEADING,
            }}
          >
            {title}
          </h2>
        )}
        {children}
      </div>
    </section>
  );
}
