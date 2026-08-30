import { ReactLenis } from "lenis/react";
import deepslateTexture from "@/assets/deepslate.png";
import dirtTexture from "@/assets/dirt.png";
import endstoneTexture from "@/assets/endstone.png";
import netherBricksTexture from "@/assets/nether_bricks.png";
import netherrackTexture from "@/assets/netherrack.png";
import sculkTexture from "@/assets/sculk_still.png";
import stoneTexture from "@/assets/stone.png";
import bedrockTexture from "@/assets/bedrock.png";
import { HomeHero } from "@/components/home-hero";
import { AboutSection } from "@/components/sections/about-section";
import { BlockTransition } from "@/components/sections/block-transition";
import {
  CommunityPartnersSection,
  NETHER_BRICK_DARKEN,
} from "@/components/sections/community-partners-section";
import { FaqSection } from "@/components/sections/faq-section";
import { FloatingIslandBase } from "@/components/sections/floating-island-base";
import { PreviousEventsSection } from "@/components/sections/previous-events-section";
import { PrizesSection } from "@/components/sections/prizes-section";
import { SponsorsSection } from "@/components/sections/sponsors-section";
import { DEEPSLATE_DARKEN, TimelineSection } from "@/components/sections/timeline-section";
import { TracksSection } from "@/components/sections/tracks-section";
import { VoidFooter } from "@/components/sections/void-footer";
import { EVENT } from "@/util/event";

/** schema.org Event data, so search results can surface the dates and venue directly. */
const eventJsonLd = {
  "@context": "https://schema.org",
  "@type": "Event",
  name: EVENT.name,
  description: `A 24-hour student hackathon hosted by ${EVENT.organizer} at ${EVENT.venue.name}.`,
  startDate: EVENT.startDate,
  endDate: EVENT.endDate,
  eventStatus: "https://schema.org/EventScheduled",
  eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
  url: EVENT.url,
  image: `${EVENT.url}/opengraph-image`,
  location: {
    "@type": "Place",
    name: EVENT.venue.name,
    address: {
      "@type": "PostalAddress",
      streetAddress: EVENT.venue.street,
      addressLocality: EVENT.venue.city,
      addressRegion: EVENT.venue.region,
      postalCode: EVENT.venue.postalCode,
      addressCountry: EVENT.venue.country,
    },
  },
  organizer: {
    "@type": "Organization",
    name: EVENT.organizer,
    url: "https://innogeeks.in",
    email: EVENT.email,
    sameAs: EVENT.socials,
  },
};

export default function Home() {
  return (
    <ReactLenis root>
      <script
        type="application/ld+json"
        // Static, author-controlled object — no user input reaches this string.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd) }}
      />
      <HomeHero />
      {/* <BlockTransition id="hero-about" top={grassTexture} bottom={dirtTexture} /> */}
      <AboutSection />
      <BlockTransition id="about-tracks" top={dirtTexture} bottom={stoneTexture} />
      <TracksSection />
      <BlockTransition
        id="tracks-timeline"
        top={stoneTexture}
        bottom={deepslateTexture}
        bottomDarken={DEEPSLATE_DARKEN}
      />
      <TimelineSection />
      <BlockTransition
        id="timeline-prizes"
        top={deepslateTexture}
        bottom={sculkTexture}
        topDarken={DEEPSLATE_DARKEN}
      />
      <PrizesSection />
      <BlockTransition id="prizes-sponsors" top={sculkTexture} bottom={bedrockTexture} />
      <SponsorsSection />
      <BlockTransition id="sponsors-previous-events" top={bedrockTexture} bottom={netherrackTexture} />
      <PreviousEventsSection />
      <BlockTransition
        id="previous-events-partners"
        top={netherrackTexture}
        bottom={netherBricksTexture}
        bottomDarken={NETHER_BRICK_DARKEN}
      />
      <CommunityPartnersSection />
      <BlockTransition
        id="partners-bedrock"
        top={netherBricksTexture}
        bottom={bedrockTexture}
        topDarken={NETHER_BRICK_DARKEN}
      />
      <BlockTransition id="bedrock-endstone" top={bedrockTexture} bottom={endstoneTexture} />
      {/* <BlockTransition id="bedrock-endstone-transitions" top={netherrackTexture} bottom={endstoneTexture} /> */}
      {/* <BlockTransition id="previous-events-faq" top={netherrackTexture} bottom={endstoneTexture} /> */}
      <FaqSection />
      <FloatingIslandBase texture={endstoneTexture} />
      <VoidFooter />
    </ReactLenis>
  );
}
