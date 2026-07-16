"use client";

import { motion } from "motion/react";
import type { StaticImageData } from "next/image";
import bedrockTexture from "@/assets/bedrock.png";
import devfolioLogo from "@/assets/devfolio.png";
import { BlockSection } from "./block-section";

const PIXEL_FONT = "var(--font-minecraft), ui-monospace, 'Courier New', monospace";

// Vanilla container-GUI palette, sampled from assets/container/generic_54.png.
const PANEL_BG = "#c6c6c6";
const PANEL_LIGHT = "#ffffff";
const PANEL_DARK = "#555555";
const PANEL_TEXT = "#404040";
const SLOT_BG = "#8b8b8b";
const SLOT_DARK = "#373737";
const SLOT_LIGHT = "#ffffff";

/** Vanilla slots are 18px on a 1px bevel. Scaled up here so real logos stay legible. */
const BEVEL = 3;

type TierId = "gold" | "hosting" | "silver" | "bronze";

type Sponsor = {
  name: string;
  tier: TierId;
  logo?: StaticImageData;
  href?: string;
  /** Backing plate behind the logo, for marks that don't carry on the gray slot. */
  logoBg?: string;
  /** Defaults to name. Override when the logo needs different alt text. */
  alt?: string;
};

type Tier = {
  id: TierId;
  label: string;
  /** Item-swatch color. Sits on the light panel, so the label text stays dark for contrast. */
  pip: string;
  slotSize: number;
  /** Defaults to slotSize. Widened where the tier holds a wordmark rather than a square mark. */
  slotWidth?: number;
  slotCount: number;
};

/** Ordered like a chest's rows — rarest loot at the top. Hosting partner sits directly below gold. */
const TIERS: Tier[] = [
  { id: "gold", label: "Gold", pip: "#fcdc5f", slotSize: 128, slotCount: 4 },
  { id: "hosting", label: "Hosting Partner", pip: "#5ff2f2", slotSize: 128, slotWidth: 320, slotCount: 1 },
  { id: "silver", label: "Silver", pip: "#dcdcdc", slotSize: 104, slotCount: 6 },
  { id: "bronze", label: "Bronze", pip: "#c87137", slotSize: 84, slotCount: 8 },
];

// Add sponsors here as they're confirmed. Unclaimed slots render empty.
const SPONSORS: Sponsor[] = [
  {
    name: "Devfolio",
    tier: "hosting",
    logo: devfolioLogo,
    href: "https://devfolio.co",
    logoBg: "#ffffff",
    alt: "DEVFOLIO LOGO",
  },
];

/** One inventory slot: dark bevel top-left, light bevel bottom-right, like the vanilla GUI. */
function Slot({
  size,
  width,
  sponsor,
  delay,
}: {
  size: number;
  width?: number;
  sponsor?: Sponsor;
  delay: number;
}) {
  const body = (
    <>
      {sponsor?.logo && (
        // Real logos aren't pixel art, so these render smoothly rather than pixelated.
        <span
          className="flex h-full w-full items-center justify-center px-3 py-2"
          style={sponsor.logoBg ? { backgroundColor: sponsor.logoBg } : undefined}
        >
          <img src={sponsor.logo.src} alt={sponsor.alt ?? sponsor.name} className="max-h-full max-w-full object-contain" />
        </span>
      )}
      {sponsor?.href && (
        <span
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-100 group-hover:opacity-50"
          style={{ backgroundColor: "#ffffff" }}
        />
      )}
    </>
  );

  const style = {
    width: width ?? size,
    height: size,
    maxWidth: "100%",
    padding: BEVEL * 2,
    backgroundColor: SLOT_BG,
    boxShadow: `inset ${BEVEL}px ${BEVEL}px 0 ${SLOT_DARK}, inset -${BEVEL}px -${BEVEL}px 0 ${SLOT_LIGHT}`,
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.3, ease: "easeOut", delay }}
    >
      {sponsor?.href ? (
        <a
          href={sponsor.href}
          target="_blank"
          rel="noreferrer noopener"
          className="group relative flex items-center justify-center"
          style={style}
        >
          {body}
        </a>
      ) : (
        <div
          className="relative flex items-center justify-center"
          style={style}
          aria-hidden={!sponsor}
          title={sponsor?.name}
        >
          {body}
        </div>
      )}
    </motion.div>
  );
}

export function SponsorsSection() {
  return (
    <BlockSection
      id="sponsors"
      title="Sponsors"
      texture={bedrockTexture}
      fallbackColor="#2b2b2f"
      seam={false}
      maxWidthClassName="max-w-5xl"
    >
      <p className="mb-2 text-xs text-white/70 md:text-sm" style={{ fontFamily: PIXEL_FONT }}>
        The bedrock InnoHacks is built on.
      </p>

      <div
        className="w-full p-5 md:p-7"
        style={{
          backgroundColor: PANEL_BG,
          boxShadow: `inset ${BEVEL + 1}px ${BEVEL + 1}px 0 ${PANEL_LIGHT}, inset -${BEVEL + 1}px -${BEVEL + 1}px 0 ${PANEL_DARK}, 0 12px 0 rgba(0,0,0,0.35), 0 18px 32px rgba(0,0,0,0.45)`,
          border: "3px solid rgba(0,0,0,0.55)",
        }}
      >
        {TIERS.map((tier, tierIndex) => {
          const filled = SPONSORS.filter((sponsor) => sponsor.tier === tier.id);
          const slots = Array.from({ length: Math.max(tier.slotCount, filled.length) });

          return (
            <div key={tier.id} className={tierIndex === 0 ? "" : "mt-7"}>
              <div className="mb-3 flex items-center justify-center gap-3">
                <span
                  aria-hidden
                  className="inline-block shrink-0"
                  style={{
                    width: 16,
                    height: 16,
                    backgroundColor: tier.pip,
                    boxShadow: `inset -3px -3px 0 rgba(0,0,0,0.35)`,
                  }}
                />
                <span
                  className="text-base uppercase tracking-[0.2em] md:text-xl"
                  style={{ color: PANEL_TEXT, fontFamily: PIXEL_FONT, fontWeight: 700 }}
                >
                  {tier.label}
                </span>
                <span
                  aria-hidden
                  className="inline-block shrink-0"
                  style={{
                    width: 16,
                    height: 16,
                    backgroundColor: tier.pip,
                    boxShadow: `inset -3px -3px 0 rgba(0,0,0,0.35)`,
                  }}
                />
              </div>
              <div className="flex flex-wrap justify-center gap-0">
                {slots.map((_, index) => (
                  <Slot
                    key={index}
                    size={tier.slotSize}
                    width={tier.slotWidth}
                    sponsor={filled[index]}
                    delay={tierIndex * 0.08 + index * 0.03}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </BlockSection>
  );
}
