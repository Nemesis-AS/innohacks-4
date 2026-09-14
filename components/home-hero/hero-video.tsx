"use client";

import { useMotionValueEvent, type MotionValue } from "motion/react";
import { useEffect, useRef } from "react";

// How hard the playhead chases the scroll position each frame. Lenis already smooths the
// scroll itself, so this only needs to take the last edge off — too high and seeks pile up,
// too low and the video visibly lags behind the page.
const LERP = 0.12;

// Don't bother seeking for less than a frame of the 60fps encode; assigning `currentTime`
// on every rAF tick queues seeks faster than the decoder retires them, which reads as stutter.
const FRAME = 1 / 60;

// Scrubbing only earns its keep on desktop: a phone has no long, smooth wheel scroll to drive
// it and seeks a lot worse, so below this width the same footage just plays on a loop.
const DESKTOP = "(min-width: 768px)";

type HeroVideoProps = {
  progress: MotionValue<number>;
  src: string;
};

/**
 * Hero backdrop video. On desktop the element never plays — its `currentTime` is driven
 * straight off the hero's scroll progress, so scrolling down runs it forward and scrolling up
 * runs it backward. On mobile it plays continuously on a loop, ignoring scroll entirely.
 */
export function HeroVideo({ progress, src }: HeroVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const targetRef = useRef(0);
  const currentRef = useRef(0);
  const durationRef = useRef(0);

  useMotionValueEvent(progress, "change", (value) => {
    targetRef.current = Math.min(1, Math.max(0, value)) * durationRef.current;
  });

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // `video.duration` is NaN until metadata lands, so seed it from the event (and once more
    // inline, for the case where the video was already cached and fired the event early).
    // Progress is only sampled on scroll, so re-derive the target here too — otherwise a reload
    // part-way down the hero would sit on frame 0 until the next scroll event.
    const readDuration = () => {
      if (!Number.isFinite(video.duration)) return;
      durationRef.current = video.duration;
      targetRef.current = Math.min(1, Math.max(0, progress.get())) * video.duration;
    };
    readDuration();
    video.addEventListener("loadedmetadata", readDuration);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const desktop = window.matchMedia(DESKTOP);

    let frame = 0;
    let unlock: (() => void) | null = null;

    const start = () => {
      // Reduced motion gets a still frame either way — no scrub, no playback.
      if (reduced) return;

      if (!desktop.matches) {
        video.loop = true;
        // Muted + `playsInline` is enough for iOS/Android to allow this without a gesture.
        video.play().catch(() => {});
        return;
      }

      // Safari refuses to decode or seek a video that has never been played, so the hero would
      // sit on its poster forever on iOS. One muted play/pause on the first interaction unlocks
      // it. Scrub mode only: in loop mode this would stop the playback we just asked for.
      unlock = () => {
        video.play().then(() => video.pause()).catch(() => {});
      };
      window.addEventListener("pointerdown", unlock, { once: true });
      window.addEventListener("touchstart", unlock, { once: true });

      // Pick the chase up from wherever the frame actually is, so switching over from loop
      // playback eases towards the scroll position instead of sweeping back from zero.
      currentRef.current = video.currentTime;

      const tick = () => {
        frame = requestAnimationFrame(tick);
        if (video.readyState < 2) return;

        const target = targetRef.current;
        currentRef.current += (target - currentRef.current) * LERP;

        if (Math.abs(currentRef.current - video.currentTime) > FRAME) {
          video.currentTime = currentRef.current;
        }
      };
      frame = requestAnimationFrame(tick);
    };

    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      if (unlock) {
        window.removeEventListener("pointerdown", unlock);
        window.removeEventListener("touchstart", unlock);
        unlock = null;
      }
      video.loop = false;
      video.pause();
    };

    // Re-run on breakpoint changes so a resize or an orientation flip doesn't strand the video
    // in the other mode — looping under a scroll that should scrub it, or frozen with nothing
    // driving it.
    const swap = () => {
      stop();
      start();
    };

    start();
    desktop.addEventListener("change", swap);

    return () => {
      stop();
      desktop.removeEventListener("change", swap);
      video.removeEventListener("loadedmetadata", readDuration);
    };
  }, [progress]);

  // No `poster`: swapping a poster still for the first decoded frame pops visibly on load.
  // The dark wrapper background covers the gap instead — a dim backdrop, not a flash of white.
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#10161f]">
      <video
        ref={videoRef}
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 h-full w-full object-cover"
      >
        <source src={src} type="video/mp4" />
      </video>

      {/* Slight scrim so the logo and sign panel stay legible — a touch heavier at the top and
          bottom, where the content sits, than through the middle of the frame. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.30) 0%, rgba(0,0,0,0.18) 45%, rgba(0,0,0,0.38) 100%)",
        }}
      />
    </div>
  );
}
