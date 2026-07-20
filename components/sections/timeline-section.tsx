"use client";

import { motion } from "motion/react";
import coalDeepslateTexture from "@/assets/coal_deepslate.png";
import deepslateTexture from "@/assets/deepslate.png";
import diamondDeepslateTexture from "@/assets/diamond_deepslate.png";
import ironDeepslateTexture from "@/assets/iron_deepslate.png";
import oakLogTexture from "@/assets/oak_log.png";
import oakSignTexture from "@/assets/oak_sign.png";
import { BlockSection } from "./block-section";

const PIXEL_FONT =
  "var(--font-minecraft), ui-monospace, 'Courier New', monospace";
const POST_TILE = 32;
const SIGN_TILE = 32;
const PEG_SIZE = 16;

type TimelineEvent = { time: string; title: string; description: string };

const EVENTS: TimelineEvent[] = [
  {
    time: "Day 1 · 8:00 AM - 9:30 AM",
    title: "Physical Check-In",
    description: "Library",
  },
  {
    time: "Day 1 · 8:30 AM - 9:30 AM",
    title: "Breakfast",
    description: "Cafeteria (1st Floor)",
  },
  {
    time: "Day 1 · 10:00 AM - 11:00 AM",
    title: "Opening Ceremony",
    description: "KSOP (Hall)",
  },
  {
    time: "Day 1 · 11:00 AM Onwards",
    title: "Start Hacking",
    description: "Library (1st Floor)",
  },
  {
    time: "Day 1 · 1:30 PM - 2:30 PM",
    title: "Lunch",
    description: "Cafeteria (1st Floor)",
  },
  {
    time: "Day 1 · 4:00 PM",
    title: "Mentoring Round - 1",
    description: "Library",
  },
  {
    time: "Day 1 · 5:00 PM - 6:00 PM",
    title: "Snacks",
    description: "Cafeteria (1st Floor)",
  },
  {
    time: "Day 1 · 6:30 PM - 7:30 PM",
    title: "Workshops",
    description: "Library",
  },
  {
    time: "Day 1 · 8:30 PM - 9:30 PM",
    title: "Dinner",
    description: "Cafeteria (1st Floor)",
  },
  {
    time: "Day 1 · 10:30 PM - 11:00 PM",
    title: "Mentoring Round - 2",
    description: "Library",
  },
  {
    time: "Day 2 · 11:00 AM - 1:00 PM",
    title: "Judging Round",
    description: "Library",
  },
  {
    time: "Day 2 · 1:00 PM - 2:00 PM",
    title: "Lunch",
    description: "Cafeteria (1st Floor)",
  },
  {
    time: "Day 2 · 2:00 PM - 3:30 PM",
    title: "Speaker Session & Closing Ceremony",
    description: "Auditorium",
  },
];

export function TimelineSection() {
  return (
    <BlockSection
      id="timeline"
      eyebrow="Deepslate Block"
      title="Timeline"
      texture={deepslateTexture}
      fallbackColor="#3a3a3e"
      oreTextures={[
        coalDeepslateTexture,
        ironDeepslateTexture,
        diamondDeepslateTexture,
      ]}
      seam={false}
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
            <div
              key={`${event.title}__${index}`}
              className="relative grid grid-cols-1 md:grid-cols-2 md:gap-10"
            >
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
                  boxShadow:
                    "0 10px 0 rgba(0,0,0,0.3), 0 14px 28px rgba(0,0,0,0.35)",
                }}
              >
                <span
                  className="text-xs uppercase tracking-[0.2em] text-white/70 md:text-sm"
                  style={{ fontFamily: PIXEL_FONT }}
                >
                  {event.time}
                </span>
                <span
                  className="text-sm uppercase text-white md:text-base"
                  style={{ fontFamily: PIXEL_FONT }}
                >
                  {event.title}
                </span>
                <span
                  className="text-xs text-white/80 md:text-sm"
                  style={{ fontFamily: PIXEL_FONT }}
                >
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
