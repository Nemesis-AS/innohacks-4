import type { ReactNode } from "react";
import signTexture from "@/assets/oak_sign.png";

const SIGN_TILE = 32;

type GlassPanelProps = { isDay: boolean; children: ReactNode };

/** Wooden sign-style panel for content sitting over the sky — a hard plank texture with a drop shadow for contrast, instead of frosted glass. */
export function GlassPanel({ isDay, children }: GlassPanelProps) {
  return (
    <div
      className="pointer-events-auto flex flex-col items-center gap-4 px-8 py-6"
      style={{
        backgroundImage: `url(${signTexture.src})`,
        backgroundSize: `${SIGN_TILE}px ${SIGN_TILE}px`,
        backgroundRepeat: "repeat",
        imageRendering: "pixelated",
        border: "3px solid #3a2615",
        boxShadow: isDay
          ? "0 10px 0 rgba(0,0,0,0.3), 0 14px 28px rgba(0,0,0,0.35)"
          : "0 10px 0 rgba(0,0,0,0.45), 0 14px 28px rgba(0,0,0,0.55)",
      }}
    >
      {children}
    </div>
  );
}
