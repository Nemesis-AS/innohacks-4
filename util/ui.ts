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

/** Visible keyboard focus ring, shared by every interactive element. */
export const FOCUS_RING =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70";

/** Sponsor/prize tier accents — the rarity colors. */
export const TIER_COLORS = {
  diamond: "#5ff2f2",
  gold: "#fcdc5f",
  silver: "#dcdcdc",
  bronze: "#c87137",
} as const;
