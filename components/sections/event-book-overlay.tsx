"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Image, { type StaticImageData } from "next/image";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { BookPage } from "./book-page";
import { POLAROID_PAPER, Polaroid } from "./polaroid";

import { DUR_MICRO, DUR_REVEAL, EASE } from "@/util/motion";
import { INK, INK_SOFT, PIXEL_FONT, bevel, bottomFadeMask } from "@/util/ui";

/** Motion-enhanced Next.js Image so the enlarged view can still fade between photos. */
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

/** Hairline rule between parchment content, faint enough to read as a pencil line. */
const RULE = "rgba(58,42,23,0.2)";
/** How much of the scroll box's bottom edge dissolves into the page, in rem. */
const SCRAPBOOK_FADE = 2.5;

/**
 * Full-screen "written book" overlay for a single past event. Left page holds the
 * event's details; the right page is a scrapbook of taped polaroids that scrolls
 * within the page, any one of which enlarges on click. Opens from a picture-frame
 * click, closes on backdrop click, the X button, or Escape.
 */
export function EventBookOverlay({
  event,
  onClose,
}: {
  event: PastEvent | null;
  onClose: () => void;
}) {
  const reduceMotion = useReducedMotion() ?? false;
  /** Which photo the enlarged view is showing; null while the scrapbook is at rest. */
  const [photoIndex, setPhotoIndex] = useState<number | null>(null);

  const gallery = event?.gallery ?? [];
  const hasGallery = gallery.length > 0;

  // Close the enlarged view whenever a different event opens. Adjusted during
  // render rather than in an effect so the gallery never paints one frame at the
  // previous event's index.
  const [renderedLabel, setRenderedLabel] = useState(event?.label);
  if (event?.label !== renderedLabel) {
    setRenderedLabel(event?.label);
    setPhotoIndex(null);
  }

  const step = useCallback(
    (dir: 1 | -1) => {
      setPhotoIndex((i) => (i === null ? null : (i + dir + gallery.length) % gallery.length));
    },
    [gallery.length],
  );

  // Escape unwinds one layer at a time — the enlarged photo first, then the book.
  // The arrows page photos only while that enlarged view is actually open.
  useEffect(() => {
    if (!event) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (photoIndex !== null) setPhotoIndex(null);
        else onClose();
      } else if (photoIndex !== null) {
        if (e.key === "ArrowRight") step(1);
        else if (e.key === "ArrowLeft") step(-1);
      }
    };
    window.addEventListener("keydown", onKey);
    // Lock body scroll behind the modal.
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [event, onClose, photoIndex, step]);

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
          key="event-book"
          role="dialog"
          aria-modal="true"
          aria-label={`${event.label} — event details`}
          // Scrolls itself rather than the page: on a phone the two stacked pages
          // are taller than the viewport, and a `fixed` box that only centres would
          // put the top of the book (and the close button) out of reach.
          // `data-lenis-prevent` keeps Lenis from stealing the wheel for the page
          // behind — and, since it covers descendants, for the scrapbook's own
          // scroll box too.
          data-lenis-prevent
          // Above the MLH badge's z-10000 — on mobile the badge is pinned top-left,
          // straight over the book's title.
          className="fixed inset-0 z-[10050] overflow-y-auto overscroll-contain"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0 : DUR_MICRO }}
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
              transition={{ duration: reduceMotion ? 0 : 0.28, ease: EASE }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button, pinned to the top-right of the spread. */}
              <PixelCloseButton
                onClick={onClose}
                label="Close event details"
                className="absolute -right-1 -top-3 z-20 sm:-right-2 sm:-top-2"
              />

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
                      <p
                        className="mt-2 text-xs md:text-sm"
                        style={{ fontFamily: PIXEL_FONT, color: INK_SOFT }}
                      >
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

                {/* ── Right page: polaroid scrapbook ── */}
                <BookPage className="md:min-h-[36rem]">
                  {hasGallery ? (
                    <ScrapbookGallery label={event.label} gallery={gallery} onOpen={setPhotoIndex} />
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

          {/* Enlarged photo, above the spread. Its own layer so the book stays put
              behind it and Escape can unwind the two separately. */}
          <AnimatePresence>
            {photoIndex !== null && hasGallery && (
              // Keyed so AnimatePresence can tell the child apart from its absence —
              // without it the exit never resolves and the lightbox stays mounted.
              <PhotoLightbox
                key="lightbox"
                label={event.label}
                gallery={gallery}
                photoIndex={photoIndex}
                onStep={step}
                onClose={() => setPhotoIndex(null)}
                reduceMotion={reduceMotion}
              />
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

/**
 * The right page: photos printed as polaroids and taped down in two tilted
 * columns. On desktop the page scrolls within itself, so a gallery of any length
 * fits at a readable size; below md the pages are already stacked and the whole
 * overlay scrolls, and a second scroll box nested inside that is miserable on touch.
 */
function ScrapbookGallery({
  label,
  gallery,
  onOpen,
}: {
  label: string;
  gallery: EventImage[];
  onOpen: (i: number) => void;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Says how many photos there are and that the page moves — without it the
          cut-off bottom row is the only hint that anything is below the fold. */}
      <div
        className="flex items-baseline justify-between border-b pb-2 text-[10px] uppercase tracking-[0.15em]"
        style={{ fontFamily: PIXEL_FONT, color: INK_SOFT, borderColor: RULE }}
      >
        <span>
          {gallery.length} {gallery.length === 1 ? "Photo" : "Photos"}
        </span>
        <span className="hidden md:inline" aria-hidden>
          Scroll ▾
        </span>
      </div>

      {/* Claims the leftover page height. The scroll box inside is taken out of
          flow on md so a tall gallery can never push the book taller instead of
          scrolling — `min-h-[36rem]` on the page is a floor, not a ceiling. */}
      <div className="md:relative md:min-h-0 md:flex-1">
        <div
          // A tilted polaroid's tape reaches ~23px above it and ~11px past its side,
          // so the padding has to clear that or the scrollport clips the corners off.
          // The bottom padding matches the fade, so it dissolves empty parchment
          // rather than the last row of photos.
          className="overscroll-contain px-4 pb-10 pt-7 [scrollbar-width:thin] md:absolute md:inset-0 md:overflow-y-auto [&::-webkit-scrollbar-thumb]:bg-[#8a6a3a] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-1.5"
          style={{
            // A mask, not a gradient overlay: it reveals the parchment texture behind
            // the content, which no flat colour could match.
            maskImage: bottomFadeMask(SCRAPBOOK_FADE),
            WebkitMaskImage: bottomFadeMask(SCRAPBOOK_FADE),
            scrollbarColor: "#8a6a3a transparent",
          }}
        >
          <div className="grid grid-cols-2 gap-x-4 gap-y-6">
            {gallery.map((src, i) => (
              // Every other photo hangs lower, so the columns interlock the way photos
              // pasted in by hand would rather than lining up in tidy rows.
              <div
                key={typeof src === "string" ? src : src.src}
                className={i % 2 === 1 ? "mt-5 md:mt-7" : undefined}
              >
                <Polaroid
                  src={src}
                  alt={`${label} photo ${i + 1} of ${gallery.length}`}
                  index={i}
                  onClick={() => onOpen(i)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * One photo picked up off the page and held at full size. Capped at 34rem because
 * the source photos top out at 540px wide — anything larger just upscales.
 */
function PhotoLightbox({
  label,
  gallery,
  photoIndex,
  onStep,
  onClose,
  reduceMotion,
}: {
  label: string;
  gallery: EventImage[];
  photoIndex: number;
  onStep: (dir: 1 | -1) => void;
  onClose: () => void;
  reduceMotion: boolean;
}) {
  const src = gallery[photoIndex];
  // Cut the paper to the photo rather than letterboxing a 3:2 shot into a 4:3
  // well — these galleries mix both, and black bars on a polaroid read as a bug.
  // Static imports carry their real dimensions; a remote URL string doesn't.
  const ratio = typeof src === "string" ? 4 / 3 : src.width / src.height;

  return (
    <motion.div
      className="fixed inset-0 z-30 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduceMotion ? 0 : DUR_MICRO }}
      // Stops propagation as well as closing: the overlay root's own click handler
      // would otherwise close the whole book behind this.
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
    >
      <div className="absolute inset-0 bg-black/75" />

      <motion.div
        className="relative w-[min(88vw,34rem)]"
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
        transition={{ duration: reduceMotion ? 0 : DUR_REVEAL * 0.5, ease: EASE }}
        onClick={(e) => e.stopPropagation()}
      >
        <PixelCloseButton onClick={onClose} label="Close photo" className="absolute -right-2 -top-3 z-20" />

        <div className="p-2 pb-4" style={POLAROID_PAPER}>
          <div className="relative overflow-hidden bg-[#1c1c1c]" style={{ aspectRatio: ratio }}>
            <AnimatePresence mode="wait">
              <MotionImage
                key={photoIndex}
                src={src}
                alt={`${label} photo ${photoIndex + 1} of ${gallery.length}`}
                fill
                sizes="(min-width: 768px) 34rem, 88vw"
                // Contain, so a photo whose ratio we couldn't read is letterboxed
                // rather than cropped — the enlarged view is the one place nothing
                // should be cut away.
                className="object-contain"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduceMotion ? 0 : DUR_MICRO }}
              />
            </AnimatePresence>

            {gallery.length > 1 && (
              <>
                <GalleryArrow dir="prev" onClick={() => onStep(-1)} />
                <GalleryArrow dir="next" onClick={() => onStep(1)} />
              </>
            )}
          </div>

          {/* Written on the polaroid's bottom lip. */}
          <p
            className="mt-2 text-center text-[10px] uppercase tracking-[0.15em]"
            style={{ fontFamily: PIXEL_FONT, color: INK_SOFT }}
          >
            {photoIndex + 1} / {gallery.length}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

/** The red pixel X, shared by the book and the enlarged photo. */
function PixelCloseButton({
  onClick,
  label,
  className = "",
}: {
  onClick: () => void;
  label: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      aria-label={label}
      // Full 40px touch target on phones, trimmed once there's a pointer.
      className={`flex h-10 w-10 items-center justify-center border-2 sm:h-9 sm:w-9 border-[#1f1f1f] bg-[#c0392b] text-lg leading-none text-white transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/80 ${className}`}
      style={{ fontFamily: PIXEL_FONT, boxShadow: bevel(2) }}
    >
      ✕
    </button>
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
