"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import stoneTexture from "@/assets/stone.png";

const PIXEL_FONT = "var(--font-minecraft), ui-monospace, 'Courier New', monospace";
const PANEL_TILE = 32;

const RAISED_BEVEL = "inset 2px 2px 0 rgba(255,255,255,0.25), inset -2px -2px 0 rgba(0,0,0,0.4)";
const PRESSED_BEVEL = "inset -2px -2px 0 rgba(255,255,255,0.2), inset 2px 2px 0 rgba(0,0,0,0.45)";

export type AccordionItem = { question: string; answer: string };

/** Minecraft GUI-panel accordion: stone-textured beveled buttons that flip from raised to pressed when expanded. */
export function Accordion({ items }: { items: AccordionItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="flex w-full flex-col gap-3">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div key={item.question} className="flex flex-col">
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : index)}
              aria-expanded={isOpen}
              className="flex items-center justify-between gap-3 px-4 py-3 text-left cursor-pointer"
              style={{
                backgroundImage: `url(${stoneTexture.src})`,
                backgroundSize: `${PANEL_TILE}px ${PANEL_TILE}px`,
                backgroundRepeat: "repeat",
                imageRendering: "pixelated",
                border: "2px solid #1f1f1f",
                boxShadow: isOpen ? PRESSED_BEVEL : RAISED_BEVEL,
              }}
            >
              <span className="text-sm uppercase text-white md:text-base" style={{ fontFamily: PIXEL_FONT, textShadow: "1px 1px 0 rgba(0,0,0,0.6)" }}>
                {item.question}
              </span>
              <span className="text-base text-white md:text-lg" style={{ fontFamily: PIXEL_FONT }}>
                {isOpen ? "−" : "+"}
              </span>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="overflow-hidden"
                  style={{
                    backgroundColor: "#1c1c1c",
                    border: "2px solid #1f1f1f",
                    borderTop: "none",
                    boxShadow: "inset 0 4px 10px rgba(0,0,0,0.5)",
                  }}
                >
                  <p
                    className="px-4 py-3 text-xs text-white/80 md:text-sm"
                    style={{ fontFamily: PIXEL_FONT }}
                  >
                    {item.answer}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
