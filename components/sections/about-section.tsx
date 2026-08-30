"use client";

import { motion, useReducedMotion } from "motion/react";
import dirtTexture from "@/assets/dirt.png";
import { VIEWPORT, DUR_REVEAL, EASE } from "@/util/motion";
import { PIXEL_FONT } from "@/util/ui";
import { BlockSection } from "./block-section";
import { BookPage } from "./book-page";
import { QuestBoard } from "./quest-board";

const INK = "#3a2a17";

export function AboutSection() {
  const reduceMotion = useReducedMotion();

  return (
    <BlockSection
      id="about"
      texture={dirtTexture}
      fallbackColor="#7c4a2d"
      seam={false}
      align="left"
    >
      <div className="grid w-full gap-6 md:grid-cols-2 md:items-stretch md:gap-0">
        <motion.div
          initial={{ opacity: 0, x: reduceMotion ? 0 : -60 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={VIEWPORT}
          transition={{ duration: DUR_REVEAL, ease: EASE }}
        >
          {/* Left page: mirrored so its stitched spine sits on the right, against the right page's spine. */}
          <BookPage flip className="h-full">
            <h2
              className="text-3xl uppercase md:text-5xl"
              style={{ color: INK, fontFamily: PIXEL_FONT, fontWeight: 700 }}
            >
              About
            </h2>
            <p className="text-sm md:text-base" style={{ color: `${INK}d9`, fontFamily: PIXEL_FONT }}>
              Innohacks 4.0 is Innogeeks’ flagship 24-hour national hackathon,
              bringing together the brightest student innovators to solve
              real-world challenges through technology. Hosted at KIET Deemed to
              be University, the event offers mentorship from industry experts,
              exciting problem statements, networking opportunities and a
              platform to transform innovative ideas into impactful solutions.
              With a legacy of successful editions, thousands of online
              engagements and participants from diverse backgrounds, InnoHacks
              4.0 continues to empower the next generation of creators,
              developers and entrepreneurs.
            </p>
          </BookPage>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: reduceMotion ? 0 : 60 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={VIEWPORT}
          transition={{ duration: DUR_REVEAL, ease: EASE, delay: 0.15 }}
        >
          {/* Right page: spine stays on the left, matching the mirrored left page across the middle. */}
          <BookPage className="h-full">
            <QuestBoard />
          </BookPage>
        </motion.div>
      </div>
    </BlockSection>
  );
}
