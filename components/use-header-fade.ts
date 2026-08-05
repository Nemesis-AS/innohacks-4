"use client";

import { useScroll, useTransform } from "motion/react";
import { useEffect, useState } from "react";

const FADE_DISTANCE = 240;

/**
 * The nav bar's scroll fade, shared with anything that should come and go alongside it.
 * Hidden over the hero — fades in once the hero releases its sticky pin and the block
 * sections start coming into view.
 */
export function useHeaderFade() {
  const { scrollY } = useScroll();
  const [fadeStart, setFadeStart] = useState(Number.POSITIVE_INFINITY);

  useEffect(() => {
    const measure = () => {
      const hero = document.getElementById("hero");
      if (!hero) return;
      setFadeStart(hero.offsetTop + hero.offsetHeight - window.innerHeight);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const opacity = useTransform(scrollY, [fadeStart, fadeStart + FADE_DISTANCE], [0, 1]);
  const pointerEvents = useTransform(opacity, (value) => (value > 0.05 ? "auto" : "none"));

  return { opacity, pointerEvents };
}
