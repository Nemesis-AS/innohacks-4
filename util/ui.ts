/**
 * Shared visual tokens for the Minecraft block-GUI language. Every bevel,
 * text shadow, and pixel-font declaration on the site should come from here
 * so the GUI chrome reads identically section to section.
 */

/** The pixel font stack; layout.tsx registers --font-minecraft from assets/fonts. */
export const PIXEL_FONT = "var(--font-minecraft), ui-monospace, 'Courier New', monospace";

/** Canonical bevel alphas — light top-left, dark bottom-right (MinecraftButton canon). */
const BEVEL_LIGHT = "rgba(255,255,255,0.25)";
const BEVEL_DARK = "rgba(0,0,0,0.35)";

/** Raised bevel: light catches the top-left edge. Width in px varies by component scale. */
export function bevel(px: number) {
  return `inset ${px}px ${px}px 0 ${BEVEL_LIGHT}, inset -${px}px -${px}px 0 ${BEVEL_DARK}`;
}

/** Hover variant: the highlight brightens as if the face tilts toward the light. */
export function bevelHover(px: number) {
  return `inset ${px}px ${px}px 0 rgba(255,255,255,0.38), inset -${px}px -${px}px 0 ${BEVEL_DARK}`;
}

/** Pressed/open variant: light and dark swap so the face reads as pushed in. */
export function bevelPressed(px: number) {
  return `inset -${px}px -${px}px 0 rgba(255,255,255,0.2), inset ${px}px ${px}px 0 rgba(0,0,0,0.45)`;
}

/** Sunken well (inventory slot): dark top-left, light bottom-right — inverse of `bevel`. */
export function bevelWell(px: number, dark = "#373737", light = "#ffffff") {
  return `inset ${px}px ${px}px 0 ${dark}, inset -${px}px -${px}px 0 ${light}`;
}

/** Drop shadow under section h2 titles. */
export const SHADOW_HEADING = "3px 3px 0 rgba(0,0,0,0.35)";
/** Drop shadow under button labels and body-size light text on textures. */
export const SHADOW_TEXT = "2px 2px 0 rgba(0,0,0,0.5)";
/** Drop shadow under small (eyebrow/caption) light text. */
export const SHADOW_SMALL = "1px 1px 0 rgba(0,0,0,0.6)";
/** Light emboss for dark ink on light surfaces (parchment, endstone, sanded oak). */
export const EMBOSS_LIGHT = "1px 1px 0 rgba(255,255,255,0.25)";

/** Ink written on parchment — the book overlay's body color. */
export const INK = "#3a2a17";
/** Faded ink for dates, labels, and other secondary parchment text. */
export const INK_SOFT = "#5b4426";

/** Visible keyboard focus ring, shared by every interactive element. */
export const FOCUS_RING =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70";

/** The same ring in ink, for controls sitting on parchment where white would vanish. */
export const FOCUS_RING_INK =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3a2a17]";

/** Sponsor/prize tier accents — the rarity colors. */
export const TIER_COLORS = {
  diamond: "#5ff2f2",
  emerald: "#41c65b",
  gold: "#fcdc5f",
  /** Refreshment partner, taking its cue from the cherry planks on its tab. */
  cherry: "#e79ba9",
  /** Certificate partner — the pale endstone on its tab, read as parchment. */
  parchment: "#e0dca8",
  white: "#ffffff",
  /** Platinum, kept cool so it reads apart from silver's neutral grey. */
  platinum: "#a8c8e8",
  silver: "#dcdcdc",
  bronze: "#c87137",
} as const;

/**
 * Horizontal mask that dissolves a strip's ends into whatever sits behind it,
 * rather than letting its box (or an `overflow-hidden` parent) slice them off.
 * `fade` is how much of the width each end spends fading, in percent.
 */
export function edgeFadeMask(fade: number) {
  return `linear-gradient(90deg, transparent 0, #000 ${fade}%, #000 ${100 - fade}%, transparent 100%)`;
}

/**
 * Vertical mask that dissolves a scroll box's bottom edge into whatever sits
 * behind it — a fade that reveals the surface below rather than painting a
 * gradient over it, which no flat color could match on a textured background.
 * Pair with bottom padding so the fade lands on empty space, not on content.
 */
export function bottomFadeMask(rem: number) {
  return `linear-gradient(to bottom, #000 calc(100% - ${rem}rem), transparent 100%)`;
}

/**
 * The advancement GUI palette, sampled straight out of assets/advancements/window.png
 * and assets/advancements/widgets.png.
 *
 * The window frame, its item frames and the advancement title bar are all the same
 * shape in different colours — a 1px black outline, a highlight along the top-left, a
 * shade along the bottom-right, and a flat body. Not one of them carries a gradient or
 * a single pixel of decoration, which is what lets them be rebuilt in CSS and stretched
 * to any size, instead of blitting (and smearing) the bitmap the way a nine-slice would.
 * The PNGs stay in assets/ as the reference these values were read from.
 */
export const GUI = {
  outline: "#000000",
  /** Window body. Vanilla reuses the same grey for a locked item frame. */
  panelBody: "#c6c6c6",
  panelLight: "#ffffff",
  panelShade: "#555555",
  /** Title-bar ink — dark on the grey panel, so it takes EMBOSS_LIGHT, not a drop shadow. */
  panelInk: "#3f3f3f",
  /** The content well is a sunken bevel: dark along the top-left, light along the bottom-right. */
  wellDark: "#212121",
  wellLight: "#929292",
  /** Earned gold. `body` fills an item frame, `bar` the slightly lighter title bar. */
  earnedBody: "#aa7e0f",
  earnedBar: "#b98f2c",
  earnedLight: "#dba213",
  earnedShade: "#493606",
  /** What a well reads as once the void noise is behind it — the flat stand-in inside a frame. */
  wellFill: "#0d0d11",
  /** Vanilla's obtained-description green, the tooltip's second line. */
  green: "#54fc54",
} as const;

/**
 * One sprite pixel, in rendered px. Reads `--adv-u`, the unitless integer multiplier an
 * advancement window sets on itself (2 on phones, 3 from `lg` up).
 *
 * A CSS variable rather than a JS `scale` prop on purpose: the multiplier changes at a
 * breakpoint, and resolving that in JS means a `matchMedia` effect that can't know the
 * answer during SSR — a hydration mismatch the pixel chrome would flash through. Kept
 * unitless so it also multiplies non-lengths, e.g. `font-size: calc(var(--adv-u) * 8px)`.
 *
 * It must stay a whole number. At 2.5 every 1px outline lands on a half pixel and the
 * whole frame antialiases into grey mush that `image-rendering: pixelated` can't rescue.
 */
export function u(n: number) {
  return `calc(var(--adv-u) * ${n}px)`;
}

/** `u(n)` measured in from the far edge, for gradient stops and clip paths. */
function un(n: number) {
  return `calc(100% - var(--adv-u) * ${n}px)`;
}

/**
 * The 2px stair-step chamfer every advancement sprite cuts into its corners — one pixel
 * in on the outermost row, two on the next. A clip path rather than a `border-radius`,
 * and every segment is axis-aligned, so it stays hard-edged instead of antialiasing the
 * way a 45° cut would.
 *
 * Apply it to a chrome layer, never to a wrapper that also holds content: clip-path
 * clips descendants, and both a tooltip and a focus ring have to escape their slot.
 */
export function chamfer() {
  const a = u(1);
  const b = u(2);
  const ra = un(1);
  const rb = un(2);
  return `polygon(${b} 0, ${rb} 0, ${rb} ${a}, ${ra} ${a}, ${ra} ${b}, 100% ${b}, 100% ${rb}, ${ra} ${rb}, ${ra} ${ra}, ${rb} ${ra}, ${rb} 100%, ${b} 100%, ${b} ${ra}, ${a} ${ra}, ${a} ${rb}, 0 ${rb}, 0 ${b}, ${a} ${b}, ${a} ${a}, ${b} ${a})`;
}

/**
 * A raised GUI plate in explicit colours: an `edge`-wide highlight along the top-left
 * and shade along the bottom-right, `edge` counted in sprite pixels. The two insets sit
 * in opposite corners and never overlap, so the order of the shadow list doesn't matter.
 *
 * Takes a number rather than a `u()` string because the bottom-right inset needs a
 * negative offset, and `-calc(…)` is not valid CSS — the browser drops the whole
 * declaration silently. The sign has to go inside the calc, which only `u()` can do.
 */
export function plate(edge: number, light: string, shade: string) {
  return `inset ${u(edge)} ${u(edge)} 0 ${light}, inset ${u(-edge)} ${u(-edge)} 0 ${shade}`;
}
