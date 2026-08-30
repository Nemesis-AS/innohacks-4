"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Image, { type StaticImageData } from "next/image";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { BookPage } from "./book-page";

import { PIXEL_FONT } from "@/util/ui";

/** Motion-enhanced Next.js Image so the gallery hero can still fade between photos. */
const MotionImage = motion.create(Image);

export type EventStat = { label: string; value: string };

export type EventImage = string | StaticImageData;

export type PastEvent = {
  label: string;
  /** Cover logo shown in the picture frame on the section. */
  photo?: string;
  alt?: string;
  date?: string;
  location?: string;
  blurb?: string;
  stats?: EventStat[];
  /** Photos taken at the event, shown in the right-hand page gallery. */
  gallery?: EventImage[];
};

/** Parchment-brown ink so text reads as written on the book page, not printed over it. */
const INK = "#3a2a17";
const INK_SOFT = "#5b4426";

/**
 * Full-screen "written book" overlay for a single past event. Left page holds the
 * event's details; the right page is a photo gallery — a hero photo with a
 * clickable thumbnail strip beneath. Opens from a picture-frame click, closes on
 * backdrop click, the X button, or Escape.
 */
export function EventBookOverlay({
  event,
  onClose,
}: {
  event: PastEvent | null;
  onClose: () => void;
}) {
  const reduceMotion = useReducedMotion() ?? false;
  const [photoIndex, setPhotoIndex] = useState(0);

  const gallery = event?.gallery ?? [];
  const hasGallery = gallery.length > 0;

  // Reset to the first photo whenever a different event opens. Adjusted during
  // render rather than in an effect so the gallery never paints one frame at the
  // previous event's index.
  const [renderedLabel, setRenderedLabel] = useState(event?.label);
  if (event?.label !== renderedLabel) {
    setRenderedLabel(event?.label);
    setPhotoIndex(0);
  }

  const step = useCallback(
    (dir: 1 | -1) => {
      if (!hasGallery) return;
      setPhotoIndex((i) => (i + dir + gallery.length) % gallery.length);
    },
    [gallery.length, hasGallery],
  );

  // Escape closes; left/right arrows page through the gallery while open.
  useEffect(() => {
    if (!event) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    // Lock body scroll behind the modal.
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [event, onClose, step]);

  // Rendered into <body> rather than in place: every BlockSection wraps its
  // children in a `relative z-10` stacking context, which would trap this
  // overlay's z-index and let later sections (FAQ, footer) paint over it.
  // No <body> during SSR — and nothing to render then either, since the overlay
  // only ever has content after a click.
  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {event && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={`${event.label} — event details`}
          // Scrolls itself rather than the page: on a phone the two stacked pages
          // are taller than the viewport, and a `fixed` box that only centres would
          // put the top of the book (and the close button) out of reach.
          // `data-lenis-prevent` keeps Lenis from stealing the wheel for the page behind.
          data-lenis-prevent
          // Above the MLH badge's z-10000 — on mobile the badge is pinned top-left,
          // straight over the book's title.
          className="fixed inset-0 z-[10050] overflow-y-auto overscroll-contain"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.2 }}
          onClick={onClose}
        >
          {/* Dimmed backdrop — fixed, so it still covers once the book is scrolled. */}
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" />

          {/* `min-h-full` + centring: short content centres, tall content grows the
              scroll area instead of being clipped off the top by flex alignment. */}
          <div className="relative flex min-h-full items-center justify-center p-4 sm:p-6">
            {/* The open book. Stop propagation so clicks inside don't close it. */}
            <motion.div
              className="relative z-10 w-full max-w-5xl"
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: reduceMotion ? 0 : 0.28, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button, pinned to the top-right of the spread. */}
              <button
                type="button"
                onClick={onClose}
                aria-label="Close event details"
                className="absolute -right-1 -top-3 z-20 flex h-10 w-10 items-center justify-center border-2 sm:-right-2 sm:-top-2 sm:h-9 sm:w-9 border-[#1f1f1f] bg-[#c0392b] text-lg leading-none text-white transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/80"
                style={{
                  fontFamily: PIXEL_FONT,
                  boxShadow: "inset 2px 2px 0 rgba(255,255,255,0.3), inset -2px -2px 0 rgba(0,0,0,0.4)",
                }}
              >
                ✕
              </button>

              {/* Below md the spread becomes one page above the other, each sized by
                  its own content — a fixed min-height there just forces scrolling
                  past empty parchment. */}
              <div className="grid grid-cols-1 gap-1 md:grid-cols-2">
                {/* ── Left page: event info ── */}
                <BookPage flip className="md:min-h-[36rem]">
                  <div className="flex h-full flex-col" style={{ color: INK }}>
                    <h3
                      className="text-xl uppercase leading-tight md:text-2xl"
                      style={{ fontFamily: PIXEL_FONT }}
                    >
                      {event.label}
                    </h3>

                    {(event.date || event.location) && (
                      <p className="mt-2 text-xs md:text-sm" style={{ fontFamily: PIXEL_FONT, color: INK_SOFT }}>
                        {[event.date, event.location].filter(Boolean).join("  ·  ")}
                      </p>
                    )}

                    <p className="mt-4 text-xs leading-relaxed md:text-sm" style={{ fontFamily: PIXEL_FONT }}>
                      {event.blurb ?? "Event recap coming soon."}
                    </p>

                    {event.stats && event.stats.length > 0 && (
                      <dl className="mt-auto grid grid-cols-2 gap-x-4 gap-y-3 pt-6">
                        {event.stats.map((stat) => (
                          <div key={stat.label}>
                            <dt
                              className="text-[10px] uppercase tracking-[0.15em]"
                              style={{ fontFamily: PIXEL_FONT, color: INK_SOFT }}
                            >
                              {stat.label}
                            </dt>
                            <dd className="text-lg md:text-xl" style={{ fontFamily: PIXEL_FONT }}>
                              {stat.value}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    )}
                  </div>
                </BookPage>

                {/* ── Right page: photo gallery ── */}
                <BookPage className="md:min-h-[36rem]">
                  {hasGallery ? (
                    <FilmstripGallery
                      label={event.label}
                      gallery={gallery}
                      photoIndex={photoIndex}
                      onSelect={setPhotoIndex}
                      onStep={step}
                      reduceMotion={reduceMotion}
                    />
                  ) : (
                    <div
                      className="flex aspect-[4/3] items-center justify-center md:aspect-auto md:h-full"
                      style={{
                        backgroundColor: "#1c1c1c",
                        border: "3px solid #3a2615",
                        boxShadow: "inset 0 4px 10px rgba(0,0,0,0.6)",
                      }}
                    >
                      <span
                        className="px-4 text-center text-xs uppercase tracking-wide text-white/60"
                        style={{ fontFamily: PIXEL_FONT }}
                      >
                        Photos coming soon
                      </span>
                    </div>
                  )}
                </BookPage>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

/** Hero photo with a row of clickable thumbnails beneath it. Scales to any count. */
function FilmstripGallery({
  label,
  gallery,
  photoIndex,
  onSelect,
  onStep,
  reduceMotion,
}: {
  label: string;
  gallery: EventImage[];
  photoIndex: number;
  onSelect: (i: number) => void;
  onStep: (dir: 1 | -1) => void;
  reduceMotion: boolean;
}) {
  return (
    <div className="flex h-full flex-col">
      {/* Hero viewport, inset like a picture frame. On mobile the page has no fixed
          height to stretch into, so the photo holds a 4:3 box of its own instead. */}
      <div
        className="relative flex aspect-[4/3] items-center justify-center overflow-hidden md:aspect-auto md:flex-1"
        style={{
          backgroundColor: "#1c1c1c",
          border: "3px solid #3a2615",
          boxShadow: "inset 0 4px 10px rgba(0,0,0,0.6)",
        }}
      >
        <AnimatePresence mode="wait">
          <MotionImage
            key={photoIndex}
            src={gallery[photoIndex]}
            alt={`${label} photo ${photoIndex + 1} of ${gallery.length}`}
            fill
            sizes="(min-width: 768px) 32rem, 100vw"
            className="object-cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.2 }}
          />
        </AnimatePresence>

        {gallery.length > 1 && (
          <>
            <GalleryArrow dir="prev" onClick={() => onStep(-1)} />
            <GalleryArrow dir="next" onClick={() => onStep(1)} />
          </>
        )}
      </div>

      {/* Thumbnail strip. Scrolls horizontally if it ever overflows. */}
      {gallery.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {gallery.map((src, i) => (
            <button
              key={typeof src === "string" ? src : src.src}
              type="button"
              aria-label={`Show photo ${i + 1}`}
              aria-current={i === photoIndex}
              onClick={() => onSelect(i)}
              className="relative h-12 w-16 shrink-0 overflow-hidden transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3a2a17]"
              style={{
                border: `2px solid ${i === photoIndex ? INK : "#8a6a3a"}`,
                opacity: i === photoIndex ? 1 : 0.6,
              }}
            >
              <Image src={src} alt="" fill sizes="4rem" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** Pixel-styled gallery paging arrow, half-inset over the photo's left or right edge. */
function GalleryArrow({ dir, onClick }: { dir: "prev" | "next"; onClick: () => void }) {
  const isPrev = dir === "prev";
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      aria-label={isPrev ? "Previous photo" : "Next photo"}
      className={`absolute top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center border-2 sm:h-9 sm:w-9 border-[#1f1f1f] bg-black/60 text-white transition-transform hover:scale-110 hover:bg-black/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/80 ${
        isPrev ? "left-2" : "right-2"
      }`}
      style={{ fontFamily: PIXEL_FONT }}
    >
      {isPrev ? "◄" : "►"}
    </button>
  );
}
