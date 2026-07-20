"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useId, useState, type ReactNode } from "react";
import deepslateTexture from "@/assets/deepslate.png";
import stoneTexture from "@/assets/stone.png";

const PIXEL_FONT = "var(--font-minecraft), ui-monospace, 'Courier New', monospace";
const PANEL_TILE = 32;

const RAISED_BEVEL = "inset 2px 2px 0 rgba(255,255,255,0.25), inset -2px -2px 0 rgba(0,0,0,0.4)";
const HOVER_BEVEL = "inset 2px 2px 0 rgba(255,255,255,0.38), inset -2px -2px 0 rgba(0,0,0,0.35)";
const PRESSED_BEVEL = "inset -2px -2px 0 rgba(255,255,255,0.2), inset 2px 2px 0 rgba(0,0,0,0.45)";

export type AccordionItem = { question: string; answer: ReactNode; list?: string[] };
export type AccordionGroup = { category: string; items: AccordionItem[] };

/**
 * Inline link styled to survive the pixel palette, with a trailing arrow so a
 * link is identifiable without relying on colour alone. The arrow is a glyph
 * rather than an icon font — it inherits size and colour for free, and nudges
 * on hover to confirm it is the affordance.
 */
export function FaqLink({ href, children }: { href: string; children: ReactNode }) {
  const external = href.startsWith("http");
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noreferrer noopener" } : {})}
      className="group/link inline-flex items-baseline gap-1 text-white underline decoration-white/40 underline-offset-4 transition-colors hover:decoration-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70"
    >
      {children}
      <span aria-hidden className="inline-block transition-transform group-hover/link:translate-x-0.5">
        ↗
      </span>
    </a>
  );
}

/** One stone-panel question. Raised when collapsed, pressed in when expanded. */
function AccordionRow({
  item,
  isOpen,
  onToggle,
  reduceMotion,
}: {
  item: AccordionItem;
  isOpen: boolean;
  onToggle: () => void;
  reduceMotion: boolean;
}) {
  const panelId = useId();
  const buttonId = `${panelId}-button`;

  return (
    <div className="flex flex-col">
      <button
        type="button"
        id={buttonId}
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className="group flex cursor-pointer items-center justify-between gap-3 px-4 py-3 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70"
        style={{
          backgroundImage: `url(${stoneTexture.src})`,
          backgroundSize: `${PANEL_TILE}px ${PANEL_TILE}px`,
          backgroundRepeat: "repeat",
          imageRendering: "pixelated",
          border: "2px solid #1f1f1f",
          boxShadow: isOpen ? PRESSED_BEVEL : RAISED_BEVEL,
        }}
        onMouseEnter={(event) => {
          if (!isOpen) event.currentTarget.style.boxShadow = HOVER_BEVEL;
        }}
        onMouseLeave={(event) => {
          if (!isOpen) event.currentTarget.style.boxShadow = RAISED_BEVEL;
        }}
      >
        <span
          className="text-sm uppercase text-white md:text-base"
          style={{ fontFamily: PIXEL_FONT, textShadow: "1px 1px 0 rgba(0,0,0,0.6)" }}
        >
          {item.question}
        </span>

        {/* Pixel chevron: two bars meeting at a point, rotated a half-turn when open. */}
        <motion.span
          aria-hidden
          className="shrink-0 text-base leading-none text-white/80 group-hover:text-white md:text-lg"
          style={{ fontFamily: PIXEL_FONT, textShadow: "1px 1px 0 rgba(0,0,0,0.6)" }}
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={reduceMotion ? { duration: 0 } : { duration: 0.2, ease: "easeInOut" }}
        >
          ▾
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={panelId}
            role="region"
            aria-labelledby={buttonId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={reduceMotion ? { duration: 0 } : { duration: 0.22, ease: "easeInOut" }}
            className="overflow-hidden"
            style={{
              // Deepslate under a dark wash: reads as the same material family as
              // the stone button without competing with the text set on it.
              backgroundImage: `linear-gradient(rgba(12,12,14,0.82), rgba(12,12,14,0.82)), url(${deepslateTexture.src})`,
              backgroundSize: `auto, ${PANEL_TILE}px ${PANEL_TILE}px`,
              backgroundRepeat: "repeat",
              imageRendering: "pixelated",
              border: "2px solid #1f1f1f",
              borderTop: "none",
              boxShadow: "inset 0 4px 10px rgba(0,0,0,0.5)",
            }}
          >
            {/* Copy settles in just behind the panel rather than with it, so the
                reveal reads as the drawer opening and then the text arriving. */}
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={
                reduceMotion ? { duration: 0 } : { duration: 0.2, delay: 0.1, ease: "easeOut" }
              }
              className="px-4 py-3 text-xs leading-relaxed text-white/80 md:text-sm"
              style={{ fontFamily: PIXEL_FONT }}
            >
              <p>{item.answer}</p>
              {item.list && (
                <ul className="mt-2 list-disc space-y-1 pl-5 marker:text-white/40">
                  {item.list.map((entry) => (
                    <li key={entry}>{entry}</li>
                  ))}
                </ul>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Minecraft GUI-panel accordion, grouped into labelled categories. Open state is
 * tracked by a flat index across all groups so only one question is ever open —
 * a category boundary should not create a second thing to close.
 */
export function Accordion({
  groups,
  categoryColor = "currentColor",
  categoryPlate = "rgba(255,255,255,0.55)",
}: {
  groups: AccordionGroup[];
  /** Category labels sit on the section background, not on a panel — they have to match its text colour. */
  categoryColor?: string;
  /** Flat wash behind a category label, to mute the section texture under small type. */
  categoryPlate?: string;
}) {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const reduceMotion = useReducedMotion() ?? false;

  return (
    <div className="flex w-full flex-col gap-8">
      {groups.map((group) => (
        <section key={group.category} className="flex flex-col gap-3">
          {/* The section texture is high-frequency noise directly behind small
              text. The label gets its own flat plate so the glyphs sit on a
              calm ground, and runs at full opacity with no highlight shadow —
              both of which were eating the counters at this size. */}
          <h3
            className="self-start px-2.5 py-1 text-xs uppercase tracking-[0.2em] md:text-sm"
            style={{
              color: categoryColor,
              fontFamily: PIXEL_FONT,
              backgroundColor: categoryPlate,
              border: "2px solid rgba(43,42,31,0.35)",
              boxShadow: "inset 1px 1px 0 rgba(255,255,255,0.35)",
            }}
          >
            {group.category}
          </h3>

          {group.items.map((item) => {
            const key = `${group.category}__${item.question}`;
            return (
              <AccordionRow
                key={key}
                item={item}
                isOpen={openKey === key}
                onToggle={() => setOpenKey(openKey === key ? null : key)}
                reduceMotion={reduceMotion}
              />
            );
          })}
        </section>
      ))}
    </div>
  );
}
