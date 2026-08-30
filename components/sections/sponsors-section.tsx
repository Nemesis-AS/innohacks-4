"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { StaticImageData } from "next/image";
import { useState } from "react";
import bedrockTexture from "@/assets/bedrock.png";
import devfolioLogo from "@/assets/devfolio.png";
import diamondOre from "@/assets/diamond_deepslate.png";
import goldOre from "@/assets/gold_nether.png";
import ironOre from "@/assets/iron_deepslate.png";
import { Glint, MinecraftButton } from "@/components/minecraft-ui";
import { EVENT } from "@/util/event";
import { BlockSection } from "./block-section";

import CodeCraftersLogo from "@/assets/sponsors/codecrafters.svg";
import TinComputerLogo from "@/assets/sponsors/tin_computers.svg";
import N8nLogo from "@/assets/sponsors/n8n.svg";
import HackermateLogo from "@/assets/sponsors/hackermate.svg";
import XyzLogo from "@/assets/sponsors/xyz.svg";
import HoverRobotixLogo from "@/assets/sponsors/hoverrobotix.png";
import Lucr8Logo from "@/assets/sponsors/lucr8.jpeg";
import MentorXLogo from "@/assets/sponsors/mentorx.png";
import RevUpLogo from "@/assets/sponsors/revup.png";

import { PIXEL_FONT } from "@/util/ui";

// Vanilla container-GUI palette, sampled from assets/container/generic_54.png.
const PANEL_BG = "#c6c6c6";
const PANEL_LIGHT = "#ffffff";
const PANEL_DARK = "#555555";
const PANEL_TEXT = "#404040";
const SLOT_BG = "#8b8b8b";
const SLOT_DARK = "#373737";
const SLOT_LIGHT = "#ffffff";

/** Unclaimed slots sit a shade darker than a filled one, so the eye lands on real logos first. */
const SLOT_EMPTY_BG = "#7a7a7a";
/** Locked-text color for the "???" placeholder in an unclaimed slot. */
const LOCKED_TEXT = "#ffffff";

/** Vanilla slots are 18px on a 1px bevel. Scaled up here so real logos stay legible. */
const BEVEL = 3;

/**
 * Warm tint for the glow behind the chest, matching the gold tier's pip. Kept as a bare
 * rgb triple the way prizes-section.tsx keeps SCULK_GLINT, since each use needs its own alpha.
 */
const GLOW_RGB = "252, 220, 95";

/** Seconds between each slot's glint, so a row shimmers out of lockstep rather than in unison. */
const GLINT_STAGGER = 1.4;

/**
 * Shared sizing for the two CTAs. MinecraftButton's `className` replaces its default
 * padding, so the padding has to be carried here too. The fixed basis makes both
 * buttons the same width regardless of label length, then they stack on narrow screens.
 */
const CTA_SIZE = "w-full max-w-[16rem] px-8 py-3 text-sm md:text-base";

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
  /** Slots are landscape rectangles — most sponsor marks are wordmarks, not square icons. */
  slotWidth: number;
  slotHeight: number;
  /** Slots per row. Extra sponsors wrap onto further rows of the same size. */
  perRow: number;
  /** Minimum slots to draw. Grows to fit however many sponsors the tier holds. */
  slotCount: number;
};

/**
 * Ordered like a chest's rows. The hosting partner leads — the platform the whole
 * hackathon runs on — then the paid tiers, rarest loot first.
 */
const TIERS: Tier[] = [
  {
    id: "hosting",
    label: "Hosting Partner",
    pip: "#5ff2f2",
    slotWidth: 300,
    slotHeight: 140,
    // There's only ever one host, so no empty slots to fill out a row.
    perRow: 1,
    slotCount: 1,
  },
  {
    id: "gold",
    label: "Gold",
    pip: "#fcdc5f",
    slotWidth: 300,
    slotHeight: 140,
    perRow: 3,
    slotCount: 3,
  },
  {
    id: "silver",
    label: "Silver",
    pip: "#dcdcdc",
    slotWidth: 232,
    slotHeight: 112,
    perRow: 4,
    slotCount: 4,
  },
  {
    id: "bronze",
    label: "Technical Partner",
    pip: "#c87137",
    slotWidth: 232,
    slotHeight: 112,
    perRow: 4,
    slotCount: 4,
  },
];

// Add sponsors here as they're confirmed. Unclaimed slots render as locked "???" slots.
const SPONSORS: Sponsor[] = [
  {
    name: "Devfolio",
    tier: "hosting",
    logo: devfolioLogo,
    href: "https://devfolio.co",
    logoBg: "#ffffff",
    alt: "DEVFOLIO LOGO",
  },
  {
    name: "Code Crafters",
    tier: "bronze",
    logo: CodeCraftersLogo,
    href: "https://codecrafters.io",
    logoBg: "#ffffff",
    alt: "CODECRAFTERS LOGO",
  },
  {
    name: "Tin Computer",
    tier: "gold",
    logo: TinComputerLogo,
    href: "https://tin.computer",
    logoBg: "#ffffff",
    alt: "TIN COMPUTER LOGO",
  },
  {
    name: "N8N",
    tier: "bronze",
    logo: N8nLogo,
    href: "https://n8n.io",
    logoBg: "#ffffff",
    alt: "N8N LOGO",
  },
  {
    name: "Hackermate",
    tier: "bronze",
    logo: HackermateLogo,
    href: "https://hackermate.in",
    logoBg: "#000000",
    alt: "HACKERMATE LOGO",
  },
  {
    name: ".xyz",
    tier: "bronze",
    logo: XyzLogo,
    href: "https://gen.xyz/",
    logoBg: "#ffffff",
    alt: ".XYZ LOGO",
  },
  {
    name: "hoverRobotix",
    tier: "bronze",
    logo: HoverRobotixLogo,
    logoBg: "#ffffff",
    alt: "HOVERROBOTIX LOGO",
  },
  {
    name: "Lucr8 Ventures",
    tier: "bronze",
    logoBg: "#ffffff",
    logo: Lucr8Logo,
    alt: "LUCR8 VENTURES LOGO",
  },
  {
    name: "MentorX",
    tier: "bronze",
    logoBg: "#000000",
    logo: MentorXLogo,
    alt: "MENTORX LOGO",
  },
  {
    name: "RevUp",
    tier: "bronze",
    logoBg: "#006867",
    logo: RevUpLogo,
    alt: "REVUP LOGO",
  },
];

/**
 * Warm pool of light behind the chest, lifting it off the bedrock. Built the way
 * prizes-section.tsx builds its sculk pool.
 *
 * `-z-10` resolves against BlockSection's `relative z-10` content wrapper — the nearest
 * stacking context — so it paints over the bedrock but under the title and the panel.
 */
function PanelGlow() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute left-1/2 top-1/2 -z-10 aspect-square w-[95%] -translate-x-1/2 -translate-y-1/2"
      style={{
        background: `radial-gradient(closest-side, rgba(${GLOW_RGB},0.16), rgba(${GLOW_RGB},0) 70%)`,
      }}
    />
  );
}

/**
 * Vanilla item tooltip: near-black fill inside the purple gradient border the game
 * draws around a hovered stack. Decorative — the slot itself carries the accessible name.
 */
function ItemTooltip({ name, tier }: { name: string; tier: Tier }) {
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 -translate-x-1/2 whitespace-nowrap"
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4 }}
      transition={{ duration: 0.12, ease: "easeOut" }}
      // The 1px gradient border is a painted parent rather than a border-image, which
      // can't take a gradient without also stretching the corners.
      style={{
        padding: 1,
        background: "linear-gradient(180deg, #5000ff, #28007f)",
        border: "2px solid #100010",
      }}
    >
      <div
        className="flex flex-col gap-0.5 px-2 py-1.5 text-[11px] leading-tight md:text-xs"
        style={{ backgroundColor: "rgba(16,0,16,0.94)", fontFamily: PIXEL_FONT }}
      >
        <span style={{ color: "#ffffff" }}>{name}</span>
        {/* Minecraft colours an item's rarity line — the tier pip is this section's rarity. */}
        <span style={{ color: tier.pip }}>{tier.label}</span>
      </div>
    </motion.div>
  );
}

/** One inventory slot: dark bevel top-left, light bevel bottom-right, like the vanilla GUI. */
function Slot({
  tier,
  sponsor,
  index,
  delay,
  reduceMotion,
}: {
  tier: Tier;
  sponsor?: Sponsor;
  index: number;
  delay: number;
  reduceMotion: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const filled = Boolean(sponsor);

  const body = (
    <>
      {sponsor?.logo && (
        // Real logos aren't pixel art, so these render smoothly rather than pixelated.
        <span
          className="flex h-full w-full items-center justify-center px-4 py-3"
          style={
            sponsor.logoBg ? { backgroundColor: sponsor.logoBg } : undefined
          }
        >
          <img
            src={sponsor.logo.src}
            alt={sponsor.alt ?? sponsor.name}
            className="max-h-full max-w-full object-contain"
          />
        </span>
      )}
      {!filled && (
        // Same "???" treatment as a locked advancement, so an unclaimed slot reads as
        // a mystery still to be revealed rather than as a hole in the grid.
        <span
          className="select-none text-lg tracking-[0.2em] md:text-2xl"
          style={{
            fontFamily: PIXEL_FONT,
            color: LOCKED_TEXT,
            textShadow: "1px 1px 0 rgba(0,0,0,0.5)",
          }}
        >
          ???
        </span>
      )}
      {filled && !reduceMotion && <Glint delay={index * GLINT_STAGGER} />}
      {sponsor?.href && (
        <span
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-100 group-hover:opacity-40"
          style={{ backgroundColor: "#ffffff" }}
        />
      )}
    </>
  );

  // Later shadows paint over earlier ones, so the tier ring is listed first and the
  // 3px bevels crop it down to a thin coloured rim just inside them.
  const bevel = [
    filled ? `inset 0 0 0 ${BEVEL * 2}px ${tier.pip}55` : null,
    `inset ${BEVEL}px ${BEVEL}px 0 ${SLOT_DARK}`,
    `inset -${BEVEL}px -${BEVEL}px 0 ${SLOT_LIGHT}`,
    // The slot lights up in its tier colour on hover. An outer ring rather than a
    // drop-shadow on the logo, which most sponsors' white backing plate would swallow.
    filled && hovered ? `0 0 0 2px ${tier.pip}88, 0 0 16px ${tier.pip}66` : null,
  ]
    .filter(Boolean)
    .join(", ");

  // Aspect ratio rather than a fixed height, so a slot keeps its shape when it
  // has to shrink to fit a narrow screen.
  const style = {
    width: "100%",
    aspectRatio: `${tier.slotWidth} / ${tier.slotHeight}`,
    padding: BEVEL * 2,
    backgroundColor: filled ? SLOT_BG : SLOT_EMPTY_BG,
    boxShadow: bevel,
    transition: "box-shadow 150ms ease-out",
  };

  // overflow-hidden lives here rather than on the motion wrapper so it clips the
  // glint sweep without also clipping the tooltip, which sits outside the slot.
  const slotClassName =
    "group relative flex items-center justify-center overflow-hidden";

  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={
        reduceMotion
          ? { duration: 0.3 }
          : { type: "spring", stiffness: 380, damping: 16, delay }
      }
      whileHover={reduceMotion || !filled ? undefined : { y: -3 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      style={{ width: tier.slotWidth, maxWidth: "100%" }}
    >
      {sponsor?.href ? (
        <a
          href={sponsor.href}
          target="_blank"
          rel="noreferrer noopener"
          className={slotClassName}
          style={style}
        >
          {body}
        </a>
      ) : (
        <div
          className={slotClassName}
          style={style}
          aria-hidden={!sponsor}
          title={sponsor?.name}
        >
          {body}
        </div>
      )}
      <AnimatePresence>
        {hovered && (
          <ItemTooltip key="tip" name={sponsor?.name ?? "???"} tier={tier} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function SponsorsSection() {
  const reduceMotion = useReducedMotion() ?? false;

  return (
    <BlockSection
      id="sponsors"
      eyebrow="▸ The bedrock InnoHacks is built on"
      title="Sponsors"
      texture={bedrockTexture}
      fallbackColor="#2b2b2f"
      // Treasure ores rather than coal — they carry the same "this is the payoff"
      // reading as the chest itself.
      oreTextures={[diamondOre, goldOre, ironOre]}
      seam={false}
      maxWidthClassName="max-w-5xl"
    >
      <div className="relative w-full">
        <PanelGlow />

        <motion.div
          className="relative z-10 w-full p-5 md:p-7"
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          style={{
            backgroundColor: PANEL_BG,
            boxShadow: `inset ${BEVEL + 1}px ${BEVEL + 1}px 0 ${PANEL_LIGHT}, inset -${BEVEL + 1}px -${BEVEL + 1}px 0 ${PANEL_DARK}, 0 12px 0 rgba(0,0,0,0.35), 0 18px 32px rgba(0,0,0,0.45)`,
            border: "3px solid rgba(0,0,0,0.55)",
          }}
        >
          {TIERS.map((tier, tierIndex) => {
            const filled = SPONSORS.filter(
              (sponsor) => sponsor.tier === tier.id,
            );
            // Pad out to whole rows so the tier always reads as complete chest rows.
            const wanted = Math.max(tier.slotCount, filled.length);
            const slots = Array.from({
              length: Math.ceil(wanted / tier.perRow) * tier.perRow,
            });
            const rowWidth = tier.perRow * tier.slotWidth;

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
                    style={{
                      color: PANEL_TEXT,
                      fontFamily: PIXEL_FONT,
                      fontWeight: 700,
                    }}
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
                {/* Tier-coloured rule, so four tiers don't run together in one grey field. */}
                <div
                  aria-hidden
                  className="mx-auto mb-3 h-[2px] w-full"
                  style={{
                    maxWidth: rowWidth,
                    backgroundColor: tier.pip,
                    opacity: 0.75,
                  }}
                />
                <div
                  className="mx-auto flex flex-wrap justify-center gap-0"
                  style={{ maxWidth: rowWidth }}
                >
                  {slots.map((_, index) => (
                    <Slot
                      key={index}
                      tier={tier}
                      sponsor={filled[index]}
                      index={index}
                      delay={tierIndex * 0.08 + index * 0.03}
                      reduceMotion={reduceMotion}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </motion.div>
      </div>

      {/* Both CTAs share CTA_SIZE so they read as a matched pair rather than a
          button next to an afterthought. Gold leads, bronze follows — the same
          tier ordering the chest above uses. */}
      <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
        <MinecraftButton
          href={`mailto:${EVENT.email}?subject=${encodeURIComponent("Sponsorship Inquiry — InnoHacks 4.0")}`}
          color="#fcdc5f"
          borderColor="#7a6410"
          textColor="#2a2205"
          glint
          className={CTA_SIZE}
          aria-label="Email us about sponsoring InnoHacks 4.0"
        >
          Sponsor Us
        </MinecraftButton>
        <MinecraftButton
          href="/innohacks-4-brochure.pdf"
          target="_blank"
          color="#c87137"
          borderColor="#5e3116"
          glint
          glintDelay={GLINT_STAGGER}
          className={CTA_SIZE}
          aria-label="Open the InnoHacks 4.0 sponsorship brochure (PDF)"
        >
          Brochure
        </MinecraftButton>
      </div>
    </BlockSection>
  );
}
