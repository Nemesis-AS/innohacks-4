"use client";

import { useState } from "react";
import goldNetherTexture from "@/assets/gold_nether.png";
import netherrackTexture from "@/assets/netherrack.png";
import quartzTexture from "@/assets/quartz.png";
import { BlockSection } from "./block-section";
import { EventBookOverlay, type PastEvent } from "./event-book-overlay";
import { PictureFrame } from "./picture-frame";

import Innohacks1 from "@/assets/events/innohacks-3/Innohacks3-1.webp";
import Innohacks2 from "@/assets/events/innohacks-3/Innohacks3-2.webp";
import Innohacks3 from "@/assets/events/innohacks-3/Innohacks3-3.webp";
import Innohacks4 from "@/assets/events/innohacks-3/Innohacks3-4.webp";
import Innohacks5 from "@/assets/events/innohacks-3/Innohacks3-5.webp";
import Innohacks6 from "@/assets/events/innohacks-3/Innohacks3-6.webp";
import Innohacks7 from "@/assets/events/innohacks-3/Innohacks3-7.webp";
import Innohacks8 from "@/assets/events/innohacks-3/Innohacks3-8.webp";

import NSAC1 from "@/assets/events/nsac/NSAC-1.webp";
import NSAC2 from "@/assets/events/nsac/NSAC-2.webp";
import NSAC3 from "@/assets/events/nsac/NSAC-3.webp";
import NSAC4 from "@/assets/events/nsac/NSAC-4.webp";
import NSAC5 from "@/assets/events/nsac/NSAC-5.webp";
import NSAC6 from "@/assets/events/nsac/NSAC-6.webp";

import IWOC1 from "@/assets/events/iwoc/IWOC-1.webp";
import IWOC2 from "@/assets/events/iwoc/IWOC-2.webp";
import IWOC3 from "@/assets/events/iwoc/IWOC-3.webp";
import IWOC4 from "@/assets/events/iwoc/IWOC-4.webp";
import IWOC5 from "@/assets/events/iwoc/IWOC-5.webp";

import { PIXEL_FONT } from "@/util/ui";

// Frames without a photo render a placeholder caption until the real image lands.
// TODO: fill in real `date`, `location`, `blurb`, `stats`, and `gallery` per event.
//       `gallery` holds photos FROM the event (Cloudinary URLs) shown in the book overlay.
const PAST_EVENTS: PastEvent[] = [
  {
    label: "InnoHacks 3.0",
    photo:
      "https://res.cloudinary.com/dp6wx6vbg/image/upload/v1784566858/Innohacks_3.0_Logo-removebg-preview.dd5c4e14b3fba966fa1a_qozjav.png",
    alt: "InnoHacks 3.0 Logo",
    date: "Feb 2025",
    location: "KIET Group of Institutions, Ghaziabad",
    blurb:
      "Innohacks 3.0 was the third edition of Innogeeks’ flagship hackathon at KIET, bringing together passionate developers, innovators, designers, and problem-solvers from across the community. The event provided participants with a platform to collaborate, build innovative solutions, and tackle real-world challenges through technology. With an engaging offline experience, industry speakers, exciting challenges, sponsors, and rewarding opportunities, Innohacks 3.0 successfully created a vibrant environment for learning, networking, and innovation.",
    stats: [
      { label: "Hackers", value: "200+" },
      { label: "Teams", value: "40" },
      { label: "Prize Pool", value: "₹1L" },
      { label: "Duration", value: "24h" },
    ],
    gallery: [
      Innohacks1,
      Innohacks2,
      Innohacks3,
      Innohacks4,
      Innohacks5,
      Innohacks6,
      Innohacks7,
      Innohacks8,
    ],
  },
  {
    label: "NASA Space Apps Challenge Ghaziabad 2025",
    photo:
      "https://res.cloudinary.com/dp6wx6vbg/image/upload/v1784566700/NASA_Space_Apps_Icon_Cropped_cxypvf.png",
    alt: "NASA Space Apps Challenge Ghzaziabad 2025",
    date: "Oct 2025",
    location: "Ghaziabad",
    blurb:
      "NASA Space Apps Ghaziabad 2025 is part of the world’s largest annual space and science hackathon, powered by NASA’s Science Mission Directorate and organized locally by Innogeeks at KIET Group of Institutions. This global innovation challenge unites coders, designers, scientists, storytellers and innovators to use NASA’s open data in solving real-world challenges on Earth and in space.",
    stats: [
      { label: "Participants", value: "150+" },
      { label: "Challenges", value: "12" },
    ],
    gallery: [NSAC1, NSAC2, NSAC3, NSAC4, NSAC5, NSAC6],
  },
  {
    label: "IWoC",
    photo:
      "https://res.cloudinary.com/dib0peewu/image/upload/v1743932084/iwoc_logo_front_badge_tmuope.png",
    alt: "IWOC Logo",
    date: "Winter 2024",
    blurb:
      "IWOC 3.0 (Innogeeks Winter of Code) was a community-driven open-source program focused on encouraging students to learn, contribute, and collaborate on real-world projects. Participants worked with mentors, explored open-source technologies, and made meaningful contributions while gaining practical development experience. The program provided a great platform for students to connect with the developer community, improve their skills, and get started with open-source development.",
    stats: [
      { label: "Contributors", value: "300+" },
      { label: "Projects", value: "25" },
    ],
    gallery: [IWOC1, IWOC2, IWOC3, IWOC4, IWOC5],
  },
];

export function PreviousEventsSection() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const activeEvent = activeIndex === null ? null : PAST_EVENTS[activeIndex];

  return (
    <BlockSection
      id="previous-events"
      title="Previous Events"
      texture={netherrackTexture}
      fallbackColor="#5b2b2b"
      oreTextures={[goldNetherTexture, quartzTexture]}
      seam={false}
      align="left"
      maxWidthClassName="max-w-4xl"
    >
      <p
        className="text-xs uppercase tracking-[0.15em] text-white/60 sm:text-sm"
        style={{
          fontFamily: PIXEL_FONT,
          textShadow: "1px 1px 0 rgba(0,0,0,0.7)",
        }}
      >
        ▸ Click an icon to open its journal
      </p>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
        {PAST_EVENTS.map((event, index) => (
          <PictureFrame
            key={event.label}
            caption={event.label}
            delay={index * 0.15}
            onActivate={() => setActiveIndex(index)}
            ariaLabel={`Open ${event.label} details`}
          >
            {event.photo ? (
              // Event photos aren't pixel art, so these render smoothly rather than pixelated.
              <img
                src={event.photo}
                alt={event.alt ?? event.label}
                className="h-full w-full object-contain"
              />
            ) : (
              <span
                className="text-center text-xs uppercase tracking-wide text-white/70"
                style={{
                  fontFamily: PIXEL_FONT,
                  textShadow: "1px 1px 0 rgba(0,0,0,0.8)",
                }}
              >
                Photo coming soon
              </span>
            )}
          </PictureFrame>
        ))}
      </div>

      <EventBookOverlay
        event={activeEvent}
        onClose={() => setActiveIndex(null)}
      />
    </BlockSection>
  );
}
