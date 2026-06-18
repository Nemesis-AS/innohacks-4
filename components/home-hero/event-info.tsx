"use client";

import { MinecraftButton, PixelBadge } from "./minecraft-ui";

const REGISTER_HREF = "#";
const EVENT_DATES = "Oct 2–3, 2026";

/** Headline, dates, and the register CTA shown beneath the logo. */
export function EventInfo() {
  return (
    <div className="flex flex-col items-center gap-4">
      <p
        className="max-w-md text-center text-sm md:text-base uppercase tracking-[0.2em]"
        style={{
          color: "#f5ead0",
          textShadow: "2px 2px 0 rgba(0,0,0,0.55)",
          fontFamily: "var(--font-minecraft), ui-monospace, 'Courier New', monospace",
        }}
      >
        Join us at KIET Deemed to be University
      </p>
      <PixelBadge>{EVENT_DATES}</PixelBadge>
      <MinecraftButton href={REGISTER_HREF}>Register Now</MinecraftButton>
    </div>
  );
}
