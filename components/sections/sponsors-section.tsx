"use client";

import { useReducedMotion } from "motion/react";
import type { StaticImageData } from "next/image";
import { useEffect, useRef, useState } from "react";
import sponsorBg from "@/assets/SPONSOR_BG.png";
import sponsorBgLeft from "@/assets/SPONSOR_BG_LEFT.png";
import sponsorBgRight from "@/assets/SPONSOR_BG_RIGHT.png";
import bedrockTexture from "@/assets/bedrock.png";
import copperOre from "@/assets/copper_stone.png";
import cherryPlanks from "@/assets/cherry_planks.png";
import devfolioLogo from "@/assets/devfolio.png";
import diamondOre from "@/assets/diamond_deepslate.png";
import endstone from "@/assets/endstone.png";
import deepslate from "@/assets/deepslate.png";
import goldOre from "@/assets/gold_nether.png";
import grassBlock from "@/assets/grass.png";
import ironOre from "@/assets/iron_deepslate.png";
import quartzOre from "@/assets/quartz.png";
import { MinecraftButton } from "@/components/minecraft-ui";
import { EVENT } from "@/util/event";
import { AdvancementFrame, type SponsorMark } from "./advancement-frame";
import { AdvancementWindow } from "./advancement-window";
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
import NavanLogo from "@/assets/sponsors/navan.svg";
import TbiLogo from "@/assets/sponsors/tbi.png";
import ElevenLabsLogo from "@/assets/sponsors/elevenlabs.svg";
import NamoIdLogo from "@/assets/sponsors/namoid.svg";
import EventopiaLogo from "@/assets/sponsors/eventopia.png";
import NeuzenLogo from "@/assets/sponsors/neuzen.png";
import OsenLogo from "@/assets/sponsors/osen.png";
import TruScholarLogo from "@/assets/sponsors/truscholar.jpeg";
import WhereUElevateLogo from "@/assets/sponsors/whereuelevate.png";
import PruneLogo from "@/assets/sponsors/prune.jpeg";

import DiamondIcon from "@/assets/sponsors/icons/diamond.png";
import GoldIcon from "@/assets/sponsors/icons/gold_ingot.png";
import IronIcon from "@/assets/sponsors/icons/iron_ingot.png";
import CopperIcon from "@/assets/sponsors/icons/copper_ingot.png";
import RedstoneIcon from "@/assets/sponsors/icons/redstone.png";
import LapisIcon from "@/assets/sponsors/icons/lapis_lazuli.png";
import CoalIcon from "@/assets/sponsors/icons/coal.png";
import GlowstoneIcon from "@/assets/sponsors/icons/glowstone_dust.png";
import QuartzIcon from "@/assets/sponsors/icons/quartz.png";
import EnderEyeIcon from "@/assets/sponsors/icons/ender_eye.png";

import { TIER_COLORS } from "@/util/ui";

/**
 * Warm tint for the glow behind the windows. Kept as a bare rgb triple the way
 * prizes-section.tsx keeps SCULK_GLINT, since each use needs its own alpha.
 */
const GLOW_RGB = "252, 220, 95";

/** Seconds between each frame's glint, so a row shimmers out of lockstep rather than in unison. */
const GLINT_STAGGER = 1.4;

/** How long a tapped tooltip holds before folding away. Touch has no hover to end it. */
const TAP_HOLD_MS = 2200;
/**
 * Added per character of blurb. The base is tuned for a name and a tier — two things you
 * recognise rather than read. A sentence has to actually be read, so it buys its own
 * time: 80ms a character is about twelve a second, the slow end of adult reading, which
 * is the end to aim at for a chunky pixel font held at arm's length.
 */
const TAP_HOLD_PER_CHAR_MS = 80;
/** Ceiling, so a sponsor who writes an essay can't pin a panel over the grid. */
const TAP_HOLD_MAX_MS = 9000;

/** Hold for one frame: the base beat, plus reading time if its sponsor carries a blurb. */
function tapHoldMs(sponsor?: SponsorMark) {
  if (!sponsor?.blurb) return TAP_HOLD_MS;
  return Math.min(
    TAP_HOLD_MAX_MS,
    TAP_HOLD_MS + sponsor.blurb.length * TAP_HOLD_PER_CHAR_MS,
  );
}

/**
 * Shared sizing for the two CTAs. MinecraftButton's `className` replaces its default
 * padding, so the padding has to be carried here too. The fixed basis makes both
 * buttons the same width regardless of label length, then they stack on narrow screens.
 */
const CTA_SIZE = "w-full max-w-[16rem] px-8 py-3 text-sm md:text-base";

type TierId =
  | "title"
  | "hosting"
  | "refreshment"
  | "certificate"
  | "ai"
  | "media"
  | "platinum"
  | "gold"
  | "silver"
  | "bronze";

type Sponsor = SponsorMark & { tier: TierId };

type Tier = {
  id: TierId;
  label: string;
  /** Tier accent, on the title bar's tab square. */
  pip: string;
  /** 16x16 block texture, the window's tab icon. */
  icon: StaticImageData;
  /** Column counts across the breakpoints. Written out in full so Tailwind can see them. */
  gridClassName: string;
  /**
   * Lowest common multiple of every column count in `gridClassName`. Slot totals round
   * up to it so the last row is full at every breakpoint at once — which can't be worked
   * out in JS, because a media query decides how many columns there actually are.
   */
  step: number;
  /** Frame aspect ratio, width over height. Hero tiers get a wider frame. */
  aspect: number;
  /** Minimum slots to draw. Grows to fit however many sponsors the tier holds. */
  slots: number;
  /**
   * Caps and centres the frame row. Without it a tier holding one or two sponsors
   * stretches a single wordmark across the full width of the window.
   */
  rowClassName?: string;
};

/**
 * Ordered rarest loot first. The title sponsor leads, then the host, then the paid
 * tiers. Every tier is its own advancement window.
 *
 * Each inner array is one row down the section. The four tiers holding a single sponsor
 * pair off two to a row — alone, a tier like that is a full-width window wrapped around
 * one logo. Tiers with a real grid keep the width to themselves.
 */
const TIER_ROWS: Tier[][] = [
  [
    {
      id: "title",
      label: "Title Sponsor",
      pip: TIER_COLORS.emerald,
      icon: DiamondIcon,
      gridClassName: "grid-cols-1",
      step: 1,
      aspect: 2.6,
      slots: 1,
      rowClassName: "mx-auto w-full max-w-sm",
    },
    {
      id: "hosting",
      label: "Hosting Partner",
      pip: TIER_COLORS.diamond,
      icon: LapisIcon,
      gridClassName: "grid-cols-1",
      step: 1,
      aspect: 2.6,
      slots: 1,
      rowClassName: "mx-auto w-full max-w-sm",
    },
  ],
  [
    {
      id: "refreshment",
      label: "Refreshment Partner",
      pip: TIER_COLORS.cherry,
      icon: RedstoneIcon,
      gridClassName: "grid-cols-1",
      step: 1,
      aspect: 2.6,
      slots: 1,
      rowClassName: "mx-auto w-full max-w-sm",
    },
    {
      id: "certificate",
      label: "Certificate Partner",
      pip: TIER_COLORS.parchment,
      icon: GlowstoneIcon,
      gridClassName: "grid-cols-1",
      step: 1,
      aspect: 2.6,
      slots: 1,
      rowClassName: "mx-auto w-full max-w-sm",
    },
  ],
  [
    {
      id: "ai",
      label: "AI Partner",
      pip: TIER_COLORS.white,
      icon: CoalIcon,
      gridClassName: "grid-cols-1",
      step: 1,
      aspect: 2.6,
      slots: 1,
      rowClassName: "mx-auto w-full max-w-sm",
    },
    {
      id: "media",
      label: "Media Partner",
      pip: TIER_COLORS.parchment,
      icon: EnderEyeIcon,
      gridClassName: "grid-cols-1",
      step: 1,
      aspect: 2.6,
      slots: 1,
      rowClassName: "mx-auto w-full max-w-sm",
    },
  ],
  [
    {
      id: "platinum",
      label: "Platinum",
      pip: TIER_COLORS.platinum,
      icon: QuartzIcon,
      gridClassName: "grid-cols-1 sm:grid-cols-2",
      step: 2,
      aspect: 2.4,
      slots: 2,
      rowClassName: "mx-auto w-full max-w-xl",
    },
  ],
  [
    {
      id: "gold",
      label: "Gold",
      pip: TIER_COLORS.gold,
      icon: GoldIcon,
      gridClassName: "grid-cols-1 sm:grid-cols-2",
      step: 2,
      aspect: 2.4,
      slots: 2,
    },
  ],
  [
    {
      id: "silver",
      label: "Silver",
      pip: TIER_COLORS.silver,
      icon: IronIcon,
      gridClassName: "grid-cols-1 sm:grid-cols-3",
      step: 3,
      aspect: 2.2,
      slots: 3,
    },
  ],
  [
    {
      id: "bronze",
      label: "Technical Partner",
      pip: TIER_COLORS.bronze,
      icon: CopperIcon,
      gridClassName: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
      // lcm(2, 3, 4) — nine sponsors round up to twelve, filling the last row at 2, 3
      // and 4 columns alike.
      step: 12,
      aspect: 2.2,
      slots: 12,
    },
  ],
];

// Add sponsors here as they're confirmed. Unclaimed slots render as locked "???" frames.
//
// `blurb` is optional, and takes the tier line's place in the hover tooltip for a sponsor
// who supplied copy of their own. Keep it short — it wraps at roughly 36 characters,
// and the panel grows upward over the window above:
//
//   blurb: "Hosting registrations, submissions and judging for InnoHacks 4.0.",
const SPONSORS: Sponsor[] = [
  {
    name: "KIET TBI",
    tier: "title",
    logo: TbiLogo,
    logoBg: "#ffffff",
    alt: "KIET TBI LOGO",
    href: "https://www.tbi-kiet.in",
  },
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
    tier: "silver",
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
    blurb:
      "Tin Computer is an autonomous growth agent. Every eligible InnoHacks 4.0 team gets $299 in Tin Computer credits, one month of the Growth plan. Credits cover up to 100 teams.",
  },
  {
    name: "N8N",
    tier: "gold",
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
    href: "https://hoverrobotix.com",
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
    href: "https://thementorx.com",
  },
  {
    name: "RevUp",
    tier: "bronze",
    logoBg: "#006867",
    logo: RevUpLogo,
    alt: "REVUP LOGO",
    href: "https://revupglobal.in",
  },
  {
    name: "Navan AI",
    tier: "silver",
    logoBg: "#ffffff",
    logo: NavanLogo,
    alt: "NAVAN AI LOGO",
    href: "https://navan.ai/",
  },
  {
    name: "ElevenLabs",
    tier: "silver",
    logo: ElevenLabsLogo,
    href: "https://elevenlabs.io",
    logoBg: "#ffffff",
    alt: "ELEVENLABS LOGO",
  },
  {
    name: "NamoID",
    tier: "bronze",
    logoBg: "#ffffff",
    logo: NamoIdLogo,
    alt: "NAMOID LOGO",
    href: "https://namoid.in",
  },
  {
    name: "Eventopia",
    tier: "media",
    logoBg: "#6c4294",
    logo: EventopiaLogo,
    alt: "EVENTOPIA LOGO",
    href: "https://eventopia.in",
  },
  {
    name: "Neuzen",
    tier: "refreshment",
    logoBg: "#ffffff",
    logo: NeuzenLogo,
    alt: "NEUZEN LOGO",
    href: "https://neuzenclub.com",
  },
  {
    name: "OSEN",
    tier: "bronze",
    logoBg: "#ffffff",
    logo: OsenLogo,
    alt: "OSEN LOGO",
    href: "https://osen.live",
  },
  {
    name: "TruScholar",
    tier: "certificate",
    logoBg: "#ffffff",
    logo: TruScholarLogo,
    alt: "TRUSCHOLAR LOGO",
    href: "https://www.truscholar.io",
  },
  {
    name: "Where U Elevate",
    tier: "platinum",
    logoBg: "#ffffff",
    logo: WhereUElevateLogo,
    alt: "WHEREUELEVATE LOGO",
    href: "https://whereuelevate.com",
  },
  {
    name: "Prune",
    tier: "ai",
    logoBg: "#000000",
    logo: PruneLogo,
    alt: "PRUNE LOGO",
    href: "https://www.withprune.com",
  },
];

/**
 * Warm pool of light behind the windows, lifting them off the bedrock. Built the way
 * prizes-section.tsx builds its sculk pool.
 *
 * `-z-10` resolves against BlockSection's `relative z-10` content wrapper — the nearest
 * stacking context — so it paints over the bedrock but under the windows.
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
 * One tier's window and its grid of frames.
 *
 * The open tooltip is tracked here rather than inside each frame: on touch there's no
 * hover to close the last one, so two tapped frames would otherwise both stay open.
 * One index per window also means one dismissal timer instead of a dozen.
 */
function TierWindow({
  tier,
  reduceMotion,
}: {
  tier: Tier;
  reduceMotion: boolean;
}) {
  const [active, setActive] = useState<number | null>(null);
  const tapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (tapTimer.current) clearTimeout(tapTimer.current);
    },
    [],
  );

  const filled = SPONSORS.filter((sponsor) => sponsor.tier === tier.id);
  const wanted = Math.max(
    tier.slots,
    Math.ceil(filled.length / tier.step) * tier.step,
  );

  const activate = (index: number) => (on: boolean, viaTouch?: boolean) => {
    if (tapTimer.current) clearTimeout(tapTimer.current);
    if (!on) {
      setActive((current) => (current === index ? null : current));
      return;
    }
    setActive(index);
    // Only a tap needs the timer. Hover and focus are closed by their own end events,
    // and arming it for them would fold the tooltip away under a resting cursor.
    if (viaTouch) {
      tapTimer.current = setTimeout(
        () => setActive((current) => (current === index ? null : current)),
        tapHoldMs(filled[index]),
      );
    }
  };

  return (
    <AdvancementWindow
      title={tier.label}
      icon={tier.icon}
      accent={tier.pip}
      reduceMotion={reduceMotion}
    >
      <div
        className={`grid ${tier.gridClassName} ${tier.rowClassName ?? ""}`}
        style={{ gap: "calc(var(--adv-u) * 4px)" }}
      >
        {Array.from({ length: wanted }).map((_, index) => (
          <AdvancementFrame
            key={index}
            sponsor={filled[index]}
            tierLabel={tier.label}
            // The tooltip's tier line takes the same accent as the window's tab pip.
            accent={tier.pip}
            aspect={tier.aspect}
            delay={index * 0.03}
            // Modulo, not a plain stagger: eleven frames at 1.4s apart would leave the
            // last one waiting fifteen seconds for its first pass.
            glintDelay={(index % 5) * GLINT_STAGGER}
            reduceMotion={reduceMotion}
            active={active === index}
            onActivate={activate(index)}
          />
        ))}
      </div>
    </AdvancementWindow>
  );
}

export function SponsorsSection() {
  // Read once and threaded down — eighteen frames subscribing individually is waste.
  const reduceMotion = useReducedMotion() ?? false;

  return (
    <BlockSection
      id="sponsors"
      eyebrow="▸ The bedrock InnoHacks is built on"
      title="Sponsors"
      image={sponsorBg}
      // The near banks, cut out of that same render and pinned back on top of it. The section
      // runs several screens deep, so `object-cover` crops the image to a narrow middle strip
      // and throws away exactly the sharp foreground that gave the shot its depth — this puts
      // it back, unstretched and untinted, framing the CTAs at the section's floor.
      flanks={{ left: sponsorBgLeft, right: sponsorBgRight }}
      // Bedrock is the fringe now, not the field: three blocks of it hold the top and
      // bottom edges flush against the neighbouring BlockTransition strips, then dissolve
      // into the scene. Three because that's ROWS in block-transition.tsx.
      texture={bedrockTexture}
      edgeBandBlocks={3}
      // Light — the render is already a night scene, and the windows carry their own panels.
      imageTint={0.25}
      fallbackColor="#2b2b2f"
      // No ore veins here: the windows already carry the section, and scattered ore
      // behind seven stacked panels just crowds them.
      seam={false}
      maxWidthClassName="max-w-5xl"
    >
      <div className="relative w-full">
        <PanelGlow />

        {/*
          --adv-u is one sprite pixel, in rendered px. It has to stay a whole number, or
          every 1px outline lands on a half pixel and the frames antialias into mush. A
          CSS variable rather than a JS scale prop so the breakpoint costs no hydration
          mismatch — see `u()` in util/ui.ts.
        */}
        <div className="relative z-10 flex w-full flex-col gap-6 [--adv-u:2] lg:gap-8 lg:[--adv-u:3]">
          {TIER_ROWS.map((row) => (
            <div
              key={row.map((tier) => tier.id).join("-")}
              // A pair splits the width from md up and stacks below it, where half of an
              // already narrow column would squeeze the logo frame. `items-start` so a row
              // never stretches the shorter window to match its neighbour.
              className={
                row.length > 1
                  ? "grid items-start gap-6 md:grid-cols-2 lg:gap-8"
                  : undefined
              }
            >
              {row.map((tier) => (
                <TierWindow
                  key={tier.id}
                  tier={tier}
                  reduceMotion={reduceMotion}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Both CTAs share CTA_SIZE so they read as a matched pair rather than a
          button next to an afterthought. Gold leads, bronze follows — the same
          tier ordering the windows above use. */}
      <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
        <MinecraftButton
          href={`mailto:${EVENT.email}?subject=${encodeURIComponent("Sponsorship Inquiry — InnoHacks 4.0")}`}
          color={TIER_COLORS.gold}
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
          color={TIER_COLORS.bronze}
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
