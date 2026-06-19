"use client";

import { motion } from "motion/react";
import coalDeepslateTexture from "@/assets/coal_deepslate.png";
import deepslateTexture from "@/assets/deepslate.png";
import diamondDeepslateTexture from "@/assets/diamond_deepslate.png";
import ironDeepslateTexture from "@/assets/iron_deepslate.png";
import oakLogTexture from "@/assets/oak_log.png";
import oakSignTexture from "@/assets/oak_sign.png";
import { BlockSection } from "./block-section";

const PIXEL_FONT = "var(--font-minecraft), ui-monospace, 'Courier New', monospace";
const POST_TILE = 32;
const SIGN_TILE = 32;
const PEG_SIZE = 16;

type TimelineEvent = { time: string; title: string; description: string };

// Placeholder schedule — swap with the real event-day timeline once finalized.
const EVENTS: TimelineEvent[] = [
  { time: "Day 1 · 09:00", title: "Check-in & Opening Ceremony", description: "Badge pickup, welcome talk, and track reveal." },
  { time: "Day 1 · 11:00", title: "Hacking Begins", description: "Teams lock in their idea and start building." },
  { time: "Day 1 · 20:00", title: "Mentor Rounds", description: "Mentors circulate for first-pass feedback." },
  { time: "Day 2 · 10:00", title: "Midpoint Check-in", description: "Progress demos to organizers, snacks included." },
  { time: "Day 2 · 18:00", title: "Submissions Close", description: "Final code freeze and project submission." },
  { time: "Day 2 · 19:00", title: "Judging & Closing Ceremony", description: "Demos, judging, and prize announcements." },
];

export function TimelineSection() {
  return (
    <BlockSection
      id="timeline"
      eyebrow="Deepslate Block"
      title="Timeline"
      texture={deepslateTexture}
      fallbackColor="#3a3a3e"
      oreTextures={[coalDeepslateTexture, ironDeepslateTexture, diamondDeepslateTexture]}
      seam={false}
      align="left"
      maxWidthClassName="max-w-4xl"
    >
      <div className="relative flex flex-col gap-14 py-6">
        <div
          className="absolute top-0 bottom-0 left-6 w-3 md:left-1/2 md:-translate-x-1/2"
          style={{
            backgroundImage: `url(${oakLogTexture.src})`,
            backgroundSize: `${POST_TILE}px ${POST_TILE}px`,
            backgroundRepeat: "repeat",
            imageRendering: "pixelated",
            border: "2px solid #3a2615",
          }}
        />

        {EVENTS.map((event, index) => {
          const isRight = index % 2 === 1;
          return (
            <div key={event.title} className="relative grid grid-cols-1 md:grid-cols-2 md:gap-10">
              <div
                className="absolute top-1/2 left-6 -translate-x-1/2 -translate-y-1/2 md:left-1/2"
                style={{
                  width: PEG_SIZE,
                  height: PEG_SIZE,
                  backgroundImage: `url(${oakLogTexture.src})`,
                  backgroundSize: "100% 100%",
                  imageRendering: "pixelated",
                  border: "2px solid #3a2615",
                }}
              />
              <motion.div
                initial={{ opacity: 0, x: isRight ? 60 : -60 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className={`ml-14 flex flex-col gap-1.5 px-5 py-4 md:ml-0 ${isRight ? "md:col-start-2" : ""}`}
                style={{
                  backgroundImage: `url(${oakSignTexture.src})`,
                  backgroundSize: `${SIGN_TILE}px ${SIGN_TILE}px`,
                  backgroundRepeat: "repeat",
                  imageRendering: "pixelated",
                  border: "3px solid #3a2615",
                  boxShadow: "0 10px 0 rgba(0,0,0,0.3), 0 14px 28px rgba(0,0,0,0.35)",
                }}
              >
                <span className="text-xs uppercase tracking-[0.2em] text-white/70 md:text-sm" style={{ fontFamily: PIXEL_FONT }}>
                  {event.time}
                </span>
                <span className="text-sm uppercase text-white md:text-base" style={{ fontFamily: PIXEL_FONT }}>
                  {event.title}
                </span>
                <span className="text-xs text-white/80 md:text-sm" style={{ fontFamily: PIXEL_FONT }}>
                  {event.description}
                </span>
              </motion.div>
            </div>
          );
        })}
      </div>
    </BlockSection>
  );
}
