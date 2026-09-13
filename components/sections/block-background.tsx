import Image, { type StaticImageData } from "next/image";
import { BLOCK_SIZE } from "@/util/constants";
import { wash } from "@/util/texture";
import { BlockFringe } from "./block-fringe";

type BlockBackgroundProps = {
  /** Section id, used as the deterministic seed for the edge fringe's ragged boundary. */
  id?: string;
  texture?: StaticImageData;
  fallbackColor: string;
  tileSize?: number;
  /** Full-bleed cover artwork behind the section. When set, `texture` is demoted to the edge band. */
  image?: StaticImageData;
  /** Dark wash (0-1) over `image`, painted under the edge band so the band's texture stays untinted. */
  imageTint?: number;
  /** Blocks of opaque `texture` held at the top and bottom edges before it fades into `image`. */
  edgeBandBlocks?: number;
  /**
   * Cutouts pinned to the section's bottom corners, in front of `image` and its tint. Meant for
   * the sharp foreground of the same render `image` comes from: a section taller than the artwork
   * is aspect-cropped to its middle by `object-cover`, and the near banks are the first thing lost.
   */
  flanks?: { left: StaticImageData; right: StaticImageData };
};

/**
 * Width of one `flanks` cutout, as a share of the section.
 *
 * A third each on a desktop-width section is the share they take up in the render they were cut
 * from, so the pair reads as one continuous scene rather than two pasted props. Narrower viewports
 * get a larger share, because these are sized against the artwork, not the column: holding 34% of
 * a phone would shrink a bank to a pebble. They still stop short of meeting in the middle, which
 * keeps them two corners rather than one ground line with a seam down it.
 *
 * `max-w` is the source PNGs' own 565px. Past that an upscale would soften the pixels, and the
 * whole point of the layer is that it's the sharp one.
 */
const FLANK_CLASS =
  "pointer-events-none absolute bottom-0 h-auto w-[46%] max-w-[35rem] select-none sm:w-[40%] lg:w-[34%]";

/** Mirrors FLANK_CLASS's breakpoints so the optimizer serves the width actually rendered. */
const FLANK_SIZES = "(min-width: 1024px) 34vw, (min-width: 640px) 40vw, 46vw";

/** Tiled block-texture background. Falls back to a flat color with a pixel grid until a real texture is supplied. */
export function BlockBackground({
  id = "",
  texture,
  fallbackColor,
  tileSize = BLOCK_SIZE,
  image,
  imageTint = 0,
  edgeBandBlocks = 0,
  flanks,
}: BlockBackgroundProps) {
  if (image) {
    return (
      // One positioned wrapper holding all three layers, so they stack in DOM order inside
      // their own context instead of each needing a slot on the section's -z scale. The
      // fallback colour backs the frames before the lazy image decodes.
      <div
        aria-hidden
        className="absolute inset-0 -z-10 overflow-hidden"
        style={{ backgroundColor: fallbackColor }}
      >
        {/*
          next/image rather than a CSS `url()`: a static import used as a background serves
          the original file from /_next/static/media untouched, where this goes through the
          optimizer and comes back as AVIF/WebP at the device's width. No `priority` — the
          section is far below the fold.
        */}
        <Image src={image} alt="" fill sizes="100vw" placeholder="blur" className="object-cover object-center" />
        {imageTint > 0 && <div className="absolute inset-0" style={{ backgroundColor: wash(imageTint) }} />}
        {flanks && (
          // Bottom corners, not full height: these are ground, and the section's floor is the
          // one edge whose position is fixed however tall the content grows. Above the tint so
          // they stay the crisp near plane against the washed-out distance behind them, and
          // still under the edge band below, which buries their base the way it does the image.
          <>
            <Image
              src={flanks.left}
              alt=""
              sizes={FLANK_SIZES}
              className={`${FLANK_CLASS} left-0`}
            />
            <Image
              src={flanks.right}
              alt=""
              sizes={FLANK_SIZES}
              className={`${FLANK_CLASS} right-0`}
            />
          </>
        )}
        {texture && edgeBandBlocks > 0 && (
          // Above the tint and so untinted, which is what lets these meet the bedrock in
          // the neighbouring BlockTransition strips at the same brightness. Two seeds, so
          // the bottom edge isn't the top one mirrored — picked for a walk that stays high
          // enough to read as a band, rather than one that breaks into scattered blocks.
          <>
            <BlockFringe
              seed={`${id}-verge`}
              texture={texture}
              edge="top"
              rows={edgeBandBlocks}
              tileSize={tileSize}
            />
            <BlockFringe
              seed={`${id}-floor`}
              texture={texture}
              edge="bottom"
              rows={edgeBandBlocks}
              tileSize={tileSize}
            />
          </>
        )}
      </div>
    );
  }

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
