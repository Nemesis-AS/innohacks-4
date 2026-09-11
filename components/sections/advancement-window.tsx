"use client";

import { motion } from "motion/react";
import type { StaticImageData } from "next/image";
import type { ReactNode } from "react";

import { DUR_REVEAL, EASE, VIEWPORT_TALL } from "@/util/motion";
import { chamfer, EMBOSS_LIGHT, GUI, PIXEL_FONT, plate, u } from "@/util/ui";
import { VoidNoiseBackground } from "./void-noise-background";

/**
 * Geometry of assets/advancements/window.png, in sprite pixels. The sprite is 252x140
 * at the top-left of a 256x256 sheet:
 *
 *   outline 1 · bevel 2 · body · well edge 1
 *
 * on every side, except the top, where the body band runs 14px tall to make room for
 * the tab name — 17px from the outer edge down to the well. Nothing here is blitted;
 * see the note on `GUI` for why the frame is rebuilt in CSS instead.
 *
 * The icon notch is the tab from assets/advancements/tabs.png, folded into that top band:
 * the same plate shape again, tall enough that it breaks the window's top outline.
 */
const OUTLINE = 1;
const BEVEL = 2;
const TITLE_BAR = 17;
/** Outer edge to well edge on the left, right and bottom. */
const FRAME = 9;
/** Vanilla's inner drop shadow, cast by the frame onto the well. */
const WELL_SHADOW = 5;
/** The tab icon is a 16x16 block texture. */
const ICON = 16;

/** The notch plate holding the tab icon: an OUTLINE+BEVEL border around the icon. */
const NOTCH = ICON + (OUTLINE + BEVEL) * 2;
/**
 * How far the notch's top pushes above the window's outline. Derived rather than typed
 * in, so the plate's bottom stays flush with the title bar's base at any TITLE_BAR.
 */
const NOTCH_RISE = NOTCH - TITLE_BAR;

/**
 * The inner shadow is 5 sprite px on every side. On a window only tall enough for one
 * row that would be ~30px of murk out of a ~150px well, so it's capped as a share of
 * the well rather than left at a flat `u(5)`.
 */
const WELL_SHADOW_MAX = "12%";

function wellShadow() {
  const depth = `min(${u(WELL_SHADOW)}, ${WELL_SHADOW_MAX})`;
  const ramp = (dir: string) =>
    `linear-gradient(${dir}, rgba(0,0,0,0.67) 0, rgba(0,0,0,0.30) 45%, rgba(0,0,0,0) ${depth})`;
  return [ramp("to bottom"), ramp("to right"), ramp("to top"), ramp("to left")].join(", ");
}

type AdvancementWindowProps = {
  /** Tab name, in the title bar. Rendered as a real heading. */
  title: string;
  /** 16x16 block texture, shown at the left of the title bar like a vanilla tab icon. */
  icon: StaticImageData;
  /** Tier colour, for the decorative tab square at the right of the title bar. */
  accent: string;
  reduceMotion?: boolean;
  children: ReactNode;
};

/**
 * One vanilla advancement window: grey GUI frame, a title bar carrying the tab icon and
 * name, and a sunken well holding whatever it's given.
 *
 * The well's height is `auto`, which is the whole payoff of rebuilding the frame rather
 * than nine-slicing the bitmap — a tier with eleven sponsors just makes a taller window,
 * with nothing stretched.
 *
 * Nothing on the path from here to `children` may clip: the frames inside lift on hover
 * and raise a tooltip that has to escape the well. `overflow-hidden` lives on the frame
 * itself (for its glint) and on the noise layer, and the chamfer is a clip path on a
 * chrome layer that holds no content.
 */
export function AdvancementWindow({
  title,
  icon,
  accent,
  reduceMotion = false,
  children,
}: AdvancementWindowProps) {
  return (
    <motion.section
      className="relative w-full"
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      // These are tall enough that VIEWPORT's 0.3 would never resolve on a phone.
      viewport={VIEWPORT_TALL}
      transition={{ duration: DUR_REVEAL, ease: EASE }}
      // The top padding reserves the notch's rise *inside* this box, so the tab can break
      // the panel's outline without overflowing the section or needing a taller stack gap.
      style={{ paddingTop: u(NOTCH_RISE), paddingBottom: u(FRAME) }}
    >
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0"
        style={{
          top: u(NOTCH_RISE),
          backgroundColor: GUI.panelBody,
          border: `${u(OUTLINE)} solid ${GUI.outline}`,
          boxShadow: plate(BEVEL, GUI.panelLight, GUI.panelShade),
          clipPath: chamfer(),
        }}
      />

      <div
        className="relative flex items-center"
        style={{
          height: u(TITLE_BAR),
          paddingLeft: u(OUTLINE + BEVEL),
          paddingRight: u(OUTLINE + BEVEL),
          gap: u(4),
        }}
      >
        {/*
          The tab notch. `self-start` plus a negative top margin, rather than letting
          `items-center` place a 22px child in a 17px row — that would offset the lift by
          2.5px and antialias every edge on the plate.
        */}
        <span
          aria-hidden
          className="relative shrink-0 self-start"
          style={{ width: u(NOTCH), height: u(NOTCH), marginTop: u(-NOTCH_RISE) }}
        >
          <span
            className="absolute inset-0"
            style={{
              backgroundColor: GUI.panelBody,
              border: `${u(OUTLINE)} solid ${GUI.outline}`,
              boxShadow: plate(BEVEL, GUI.panelLight, GUI.panelShade),
              clipPath: chamfer(),
            }}
          />
          {/*
            Sized explicitly, not left to the inset: `width: auto` on an absolutely
            positioned *replaced* element resolves to the image's intrinsic size, and the
            `right`/`bottom` insets are then dropped as over-constrained — which pins the
            texture to the top-left corner at whatever size the PNG happens to be. NOTCH is
            ICON plus the border on both sides, so an ICON square at this inset is centred.
          */}
          <img
            src={icon.src}
            alt=""
            className="absolute"
            style={{
              inset: u(OUTLINE + BEVEL),
              width: u(ICON),
              height: u(ICON),
              imageRendering: "pixelated",
            }}
          />
        </span>
        {/*
          The name sits in a groove: `plate` inverted — shade along the top-left, light
          along the bottom-right — so the strip reads pressed into the panel. u(11) in a
          u(17) bar leaves u(3) of slack each side, keeping its 1px insets on the grid.
        */}
        <div
          className="flex min-w-0 flex-1 items-center justify-center"
          style={{
            height: u(11),
            padding: `0 ${u(3)}`,
            boxShadow: plate(OUTLINE, GUI.panelShade, GUI.panelLight),
          }}
        >
          {/* Truncation is visual only — the full name stays in the DOM for assistive tech. */}
          <h3
            className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-center uppercase"
            style={{
              color: GUI.panelInk,
              fontFamily: PIXEL_FONT,
              fontSize: u(8),
              lineHeight: 1,
              // Dark ink on the grey panel takes a light emboss; a dark shadow only muddies it.
              textShadow: EMBOSS_LIGHT,
            }}
          >
            {title}
          </h3>
        </div>
        {/*
          Vanilla's little tab button at the far right: a raised grey plate with a 4x4
          square inset into it, which is where the tier colour lands.
        */}
        <span
          aria-hidden
          className="relative hidden shrink-0 sm:block"
          style={{ width: u(10), height: u(10) }}
        >
          <span
            className="absolute inset-0"
            style={{
              backgroundColor: GUI.panelBody,
              border: `${u(OUTLINE)} solid ${GUI.outline}`,
              boxShadow: plate(OUTLINE, GUI.panelLight, GUI.panelShade),
            }}
          />
          <span
            className="absolute"
            style={{
              inset: u(3),
              backgroundColor: accent,
              boxShadow: `inset 0 0 0 ${u(OUTLINE)} rgba(0,0,0,0.55)`,
            }}
          />
        </span>
      </div>

      <div
        className="relative"
        style={{
          marginLeft: u(FRAME),
          marginRight: u(FRAME),
          // A stacking context, so the noise can sit at -z without escaping behind the frame.
          zIndex: 0,
          boxShadow: plate(OUTLINE, GUI.wellDark, GUI.wellLight),
        }}
      >
        <div aria-hidden className="absolute inset-0 overflow-hidden">
          <VoidNoiseBackground />
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: wellShadow() }}
        />
        <div className="relative" style={{ padding: u(WELL_SHADOW) }}>
          {children}
        </div>
      </div>
    </motion.section>
  );
}
