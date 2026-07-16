"use client";

import { motion } from "motion/react";
import dirtTexture from "@/assets/dirt.png";
import { BlockSection } from "./block-section";
import { BookPage } from "./book-page";
import { QuestBoard } from "./quest-board";

const PIXEL_FONT = "var(--font-minecraft), ui-monospace, 'Courier New', monospace";
const INK = "#3a2a17";

export function AboutSection() {
  return (
    <BlockSection id="about" texture={dirtTexture} fallbackColor="#7c4a2d" seam={false} align="left">
      <div className="grid w-full gap-6 md:grid-cols-2 md:items-stretch md:gap-0">
        <motion.div
          initial={{ opacity: 0, x: -60 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          {/* Left page: mirrored so its stitched spine sits on the right, against the right page's spine. */}
          <BookPage flip className="h-full">
            <h2
              className="text-3xl uppercase md:text-5xl"
              style={{ color: INK, fontFamily: PIXEL_FONT, fontWeight: 700 }}
            >
              About
            </h2>
            <p className="text-lg md:text-xl" style={{ color: `${INK}d9`, fontFamily: PIXEL_FONT }}>
              Placeholder copy — what InnoHacks 4.0 is, who it's for, and why you should show up. A weekend of
              building, breaking, and shipping with a few hundred other people who'd rather make something than
              talk about making something.
            </p>
          </BookPage>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.15 }}
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
