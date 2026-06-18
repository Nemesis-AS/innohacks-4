import type { Metadata } from "next";
import { ReactLenis } from "lenis/react";
import deepslateTexture from "@/assets/deepslate.png";
import dirtTexture from "@/assets/dirt.png";
import endstoneTexture from "@/assets/endstone.png";
import netherrackTexture from "@/assets/netherrack.png";
import stoneTexture from "@/assets/stone.png";
import bedrockTexture from "@/assets/bedrock.png";
import { HomeHero } from "@/components/home-hero";
import { AboutSection } from "@/components/sections/about-section";
import { BlockTransition } from "@/components/sections/block-transition";
import { FaqSection } from "@/components/sections/faq-section";
import { FloatingIslandBase } from "@/components/sections/floating-island-base";
import { PreviousEventsSection } from "@/components/sections/previous-events-section";
import { TimelineSection } from "@/components/sections/timeline-section";
import { TracksSection } from "@/components/sections/tracks-section";
import { VoidFooter } from "@/components/sections/void-footer";

export const metadata: Metadata = {
  title: "Minecraft Day/Night Cycle",
  description: "A scroll-driven simulation of Minecraft's day/night cycle.",
  openGraph: {
    title: "Minecraft Day/Night Cycle",
    description: "Scroll to move the sun and moon across a procedural Minecraft sky.",
  },
};

export default function Home() {
  return (
    <ReactLenis root>
      <HomeHero />
      {/* <BlockTransition id="hero-about" top={grassTexture} bottom={dirtTexture} /> */}
      <AboutSection />
      <BlockTransition id="about-tracks" top={dirtTexture} bottom={stoneTexture} />
      <TracksSection />
      <BlockTransition id="tracks-timeline" top={stoneTexture} bottom={deepslateTexture} />
      <TimelineSection />
      {/* <BlockTransition id="timeline-previous-events" top={deepslateTexture} bottom={netherrackTexture} /> */}
      <BlockTransition id="timeline-previous-events" top={deepslateTexture} bottom={bedrockTexture} />
      <BlockTransition id="timeline-previous-events" top={bedrockTexture} bottom={netherrackTexture} />
      <PreviousEventsSection />
      <BlockTransition id="bedrock-endstone-transition" top={netherrackTexture} bottom={bedrockTexture} />
      <BlockTransition id="bedrock-endstone-transition" top={bedrockTexture} bottom={endstoneTexture} />
      {/* <BlockTransition id="previous-events-faq" top={netherrackTexture} bottom={endstoneTexture} /> */}
      <FaqSection />
      <FloatingIslandBase texture={endstoneTexture} />
      <VoidFooter />
    </ReactLenis>
  );
}
