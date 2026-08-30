import type { ReactNode } from "react";
import plateTexture from "@/assets/hero_bg.png";

// The art carries its own bands — grass across the top ~11% of the plate, stone along the
// bottom ~14% — and the plate is stretched to whatever the content needs, so both scale
// with it. This padding clears them at the ~200px height this block renders at.
const PLATE_PADDING = { top: 32, bottom: 40, x: 40 };

type GlassPanelProps = { isDay: boolean; children: ReactNode };

/** Dirt-block plate for the hero copy — the art carries its own rounded edge, so the panel has no border of its own and takes its shadow from the image's alpha. */
export function GlassPanel({ isDay, children }: GlassPanelProps) {
  return (
    <div
      className="pointer-events-auto flex flex-col items-center gap-4"
      style={{
        backgroundImage: `url(${plateTexture.src})`,
        // Stretched, not tiled: the plate is one piece of art with a baked-in rounded edge.
        backgroundSize: "100% 100%",
        backgroundRepeat: "no-repeat",
        paddingTop: PLATE_PADDING.top,
        paddingBottom: PLATE_PADDING.bottom,
        paddingLeft: PLATE_PADDING.x,
        paddingRight: PLATE_PADDING.x,
        // drop-shadow, not box-shadow: the box is square, the art isn't.
        filter: isDay
          ? "drop-shadow(0 10px 0 rgba(0,0,0,0.3)) drop-shadow(0 14px 28px rgba(0,0,0,0.35))"
          : "drop-shadow(0 10px 0 rgba(0,0,0,0.45)) drop-shadow(0 14px 28px rgba(0,0,0,0.55))",
      }}
    >
      {children}
    </div>
  );
}
