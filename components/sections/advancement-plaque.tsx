"use client";

import type { StaticImageData } from "next/image";
import widgetsTexture from "@/assets/advancements/widgets.png";

import { PIXEL_FONT } from "@/util/ui";

/**
 * Geometry within assets/advancements/widgets.png — the vanilla advancement-tree
 * sheet, 256x256. Values are sprite pixels, multiplied by `scale` at render time so
 * the pixel grid stays exact (a fractional scale smears the bevels even under
 * image-rendering: pixelated).
 *
 * The title bar is 200x26 at x=0, stacked by state:
 *   y=0  gold (earned)   y=26 blue (unused here)   y=52 dark grey (locked)
 *
 * Rows 5-20 of every bar are byte-identical across the full 200px width, and each
 * is just five colour runs: 1px black, 1px highlight, 196px body, 1px shade, 1px
 * black. That's what makes the plaque stretchable to any height — the two 5-row
 * caps come from the real sprite so the rounded corners stay vanilla, and the band
 * between them is rebuilt as a hard-stop gradient in exactly those colours. No
 * vertical stretch is ever applied to the bitmap itself.
 */
const SHEET = 256;
const BAR_W = 200;
const BAR_H = 26;

/** Rows 0-4 and 21-25: the sprite's own top and bottom edges. */
const CAP = 5;

const BAR_Y_EARNED = 0;
const BAR_Y_LOCKED = 52;

/** Total plaque height in sprite pixels. Taller than the vanilla 26 to give a wordmark room. */
const DEFAULT_HEIGHT = 44;

/** Middle-band colours, sampled straight out of the sheet at row 10. */
const BAND_EARNED = { light: "#dba213", body: "#b98f2c", shade: "#493606" };
const BAND_LOCKED = { light: "#555555", body: "#212121", shade: "#555555" };
const EDGE = "#000000";

export type Partner = {
  name: string;
  logo?: StaticImageData;
  href?: string;
  /** Backing plate behind the logo, for marks that don't carry on the bar. */
  logoBg?: string;
  /** Defaults to name. */
  alt?: string;
  /** Renders the vanilla locked advancement — grey bar, "???". */
  locked?: boolean;
};

type AdvancementPlaqueProps = Partner & {
  /** Rendered pixels per sprite pixel. Keep it a whole number. */
  scale?: number;
  /** Plaque height in sprite pixels. Must leave room for both 5px caps. */
  height?: number;
  /** Trailing gap in px. Lives inside the plaque so a marquee's two halves measure identically. */
  gap?: number;
};

/**
 * One community partner as a vanilla advancement plaque: the advancement title bar,
 * stretched taller, carrying their mark and name. Unconfirmed partners render in the
 * grey locked state rather than being hidden, so the rail stays full.
 */
export function AdvancementPlaque({
  name,
  logo,
  href,
  logoBg,
  alt,
  locked = false,
  scale = 3,
  height = DEFAULT_HEIGHT,
  gap = 0,
}: AdvancementPlaqueProps) {
  const barY = locked ? BAR_Y_LOCKED : BAR_Y_EARNED;
  const band = locked ? BAND_LOCKED : BAND_EARNED;

  const width = BAR_W * scale;
  const capHeight = CAP * scale;
  const bandHeight = Math.max(0, (height - CAP * 2) * scale);

  const cap = {
    width,
    height: capHeight,
    backgroundImage: `url(${widgetsTexture.src})`,
    backgroundSize: `${SHEET * scale}px ${SHEET * scale}px`,
    backgroundRepeat: "no-repeat" as const,
    imageRendering: "pixelated" as const,
  };

  const px = (n: number) => `${n * scale}px`;

  const plaque = (
    <div className="relative" style={{ width, height: height * scale }}>
      <div aria-hidden style={{ ...cap, backgroundPosition: `0 ${-barY * scale}px` }} />
      <div
        aria-hidden
        style={{
          width,
          height: bandHeight,
          background: `linear-gradient(90deg, ${EDGE} 0 ${px(1)}, ${band.light} ${px(1)} ${px(2)}, ${band.body} ${px(2)} calc(100% - ${px(2)}), ${band.shade} calc(100% - ${px(2)}) calc(100% - ${px(1)}), ${EDGE} calc(100% - ${px(1)}) 100%)`,
        }}
      />
      <div
        aria-hidden
        style={{ ...cap, backgroundPosition: `0 ${-(barY + BAR_H - CAP) * scale}px` }}
      />

      <div
        className="absolute inset-0 flex items-center"
        style={{ paddingLeft: px(6), paddingRight: px(6), gap: px(6) }}
      >
        {logo && (
          // Partner marks aren't pixel art, so these render smoothly rather than pixelated.
          <span
            className="flex shrink-0 items-center justify-center"
            style={{
              height: (height - 16) * scale,
              maxWidth: "44%",
              backgroundColor: logoBg,
              padding: logoBg ? px(2) : undefined,
            }}
          >
            <img
              src={logo.src}
              alt={alt ?? name}
              className="max-h-full max-w-full object-contain"
            />
          </span>
        )}
        <span
          className="overflow-hidden text-ellipsis whitespace-nowrap"
          style={{
            color: locked ? "#888888" : "#ffffff",
            fontFamily: PIXEL_FONT,
            fontSize: 8 * scale,
            lineHeight: 1,
            textShadow: "1px 1px 0 rgba(0,0,0,0.5)",
          }}
        >
          {locked ? "???" : name}
        </span>
      </div>
    </div>
  );

  const outer = { marginRight: gap };

  if (locked) {
    return (
      <div aria-hidden className="shrink-0 select-none" style={outer}>
        {plaque}
      </div>
    );
  }

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer noopener"
        className="shrink-0 select-none transition-[filter] duration-150 hover:brightness-115 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/80"
        style={outer}
      >
        {plaque}
      </a>
    );
  }

  return (
    <div className="shrink-0 select-none" style={outer} title={name}>
      {plaque}
    </div>
  );
}
