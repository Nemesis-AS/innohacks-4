"use client";

import { useReducedMotion } from "motion/react";
import netherBricksTexture from "@/assets/nether_bricks.png";
import { MinecraftButton } from "@/components/minecraft-ui";
import { EVENT } from "@/util/event";
import { AdvancementPlaque, type Partner } from "./advancement-plaque";
import { BlockSection } from "./block-section";

import { PIXEL_FONT } from "@/util/ui";

/**
 * Fortress interiors are lit by lava, not daylight. Exported so the neighbouring
 * BlockTransitions can wash their half of the strip to match — an un-darkened
 * transition against a darkened section reads as a bright band across the page.
 */
export const NETHER_BRICK_DARKEN = 0.3;

/** Seconds each plaque spends crossing the rail, so adding partners lengthens the loop rather than speeding it up. */
const SECONDS_PER_PLAQUE = 6;

/** Trailing gap between plaques, in px. Carried inside each plaque so both halves of the marquee measure identically. */
const PLAQUE_GAP = 40;

/**
 * Add partners here as they're confirmed: fill in `name`, `logo`, `href`, and drop
 * `locked`. Logos live in assets/partners/, alongside assets/sponsors/. Anything
 * still locked renders as a grey "???" advancement rather than an empty gap.
 */
const PARTNERS: Partner[] = [
  { name: "Partner 1", locked: true },
  { name: "Partner 2", locked: true },
  { name: "Partner 3", locked: true },
  { name: "Partner 4", locked: true },
  { name: "Partner 5", locked: true },
  { name: "Partner 6", locked: true },
  { name: "Partner 7", locked: true },
  { name: "Partner 8", locked: true },
];

/** One copy of the plaque list. Rendered twice into the marquee track. */
function Plaques({ scale }: { scale: number }) {
  return (
    <>
      {PARTNERS.map((partner, index) => (
        <AdvancementPlaque key={`${partner.name}-${index}`} {...partner} scale={scale} gap={PLAQUE_GAP} />
      ))}
    </>
  );
}

export function CommunityPartnersSection() {
  const reduceMotion = useReducedMotion() ?? false;
  const duration = PARTNERS.length * SECONDS_PER_PLAQUE;

  // Fades the plaques into the brickwork instead of letting overflow-hidden slice them.
  const edgeFade =
    "linear-gradient(90deg, transparent 0, #000 6%, #000 94%, transparent 100%)";

  return (
    <BlockSection
      id="community-partners"
      eyebrow="▸ The allies who make the raid possible"
      title="Community Partners"
      texture={netherBricksTexture}
      fallbackColor="#4a1f1f"
      darken={NETHER_BRICK_DARKEN}
      seam={false}
      maxWidthClassName="max-w-6xl"
    >
      <div className="relative w-full py-10">
        {reduceMotion ? (
          // No loop to fall out of sync with — one static, wrapped set instead.
          <div className="flex flex-wrap justify-center gap-y-6">
            <Plaques scale={2} />
          </div>
        ) : (
          <div
            className="group relative overflow-hidden"
            style={{ maskImage: edgeFade, WebkitMaskImage: edgeFade }}
          >
            <div
              className="flex w-max group-hover:[animation-play-state:paused]"
              style={{ animation: `plaque-marquee ${duration}s linear infinite` }}
            >
              <Plaques scale={3} />
              {/* Second copy is decorative — it would otherwise duplicate every partner link to assistive tech. */}
              <div aria-hidden className="flex shrink-0">
                <Plaques scale={3} />
              </div>
            </div>
          </div>
        )}
      </div>

      <MinecraftButton
        href={`mailto:${EVENT.email}?subject=${encodeURIComponent("Partner Inquiry — InnoHacks 4.0")}`}
        color="#c084fc"
        borderColor="#5b2d80"
        textColor="#1a1206"
        aria-label="Email us about becoming a community partner"
      >
        Become a Partner
      </MinecraftButton>
    </BlockSection>
  );
}
