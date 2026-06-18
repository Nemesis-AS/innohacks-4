"use client";

import { useLenis } from "lenis/react";
import { motion, useScroll, useTransform } from "motion/react";
import { useEffect, useState, type MouseEvent } from "react";
import dirtTexture from "@/assets/dirt.png";
import grassTexture from "@/assets/grass.png";
import logoImg from "@/assets/innohacks-logo.png";

const PIXEL_FONT = "var(--font-minecraft), ui-monospace, 'Courier New', monospace";
const GRASS_TILE = 16;
const GRASS_CAP_HEIGHT = 10;
const DIRT_TILE = 32;
const FADE_DISTANCE = 240;

const NAV_LINKS = [
  { label: "About", href: "#about" },
  { label: "Tracks", href: "#tracks" },
  { label: "Timeline", href: "#timeline" },
  { label: "Events", href: "#previous-events" },
  { label: "FAQs", href: "#faqs" },
];

/**
 * Floating nav bar, detached from the top and sides of the viewport. Hidden over the
 * hero — fades in once the hero releases its sticky pin and the block sections start
 * coming into view.
 */
export function Header() {
  const { scrollY } = useScroll();
  const lenis = useLenis();
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

  const handleNavClick = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
    const target = document.querySelector(href);
    if (!target) return;
    event.preventDefault();
    if (lenis) {
      lenis.scrollTo(target as HTMLElement);
    } else {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <motion.header className="fixed inset-x-2 top-4 z-50 md:inset-x-6" style={{ opacity, pointerEvents }}>
      <div className="relative mx-auto max-w-7xl">
        <div
          className="absolute inset-x-0 top-0 -translate-y-[9px]"
          style={{
            height: GRASS_CAP_HEIGHT,
            backgroundImage: `url(${grassTexture.src})`,
            backgroundSize: `${GRASS_TILE}px ${GRASS_TILE}px`,
            backgroundRepeat: "repeat",
            imageRendering: "pixelated",
            border: "2px solid #1f2e14",
            borderBottom: "none",
          }}
        />
        <div
          className="flex items-center justify-between gap-4 overflow-hidden px-4 py-2 md:px-6"
          style={{
            backgroundImage: `url(${dirtTexture.src})`,
            backgroundSize: `${DIRT_TILE}px ${DIRT_TILE}px`,
            backgroundRepeat: "repeat",
            imageRendering: "pixelated",
            border: "2px solid #1f2e14",
            borderRadius: "0 0 14px 14px",
            boxShadow: "0 10px 28px rgba(0,0,0,0.4)",
          }}
        >
          <a
            href="#hero"
            onClick={(event) => handleNavClick(event, "#hero")}
            className="flex shrink-0 select-none items-center"
          >
            <img
              src={logoImg.src}
              alt="InnoHacks 4.0"
              className="h-7 w-auto md:h-8"
              style={{ imageRendering: "pixelated" }}
            />
          </a>
          <nav className="flex items-center gap-0.5 md:gap-1.5">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(event) => handleNavClick(event, link.href)}
                className="px-2 py-1.5 text-[10px] uppercase tracking-[0.15em] text-white/85 transition-colors hover:text-white md:px-3 md:text-xs"
                style={{ fontFamily: PIXEL_FONT, textShadow: "1px 1px 0 rgba(0,0,0,0.6)" }}
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </motion.header>
  );
}
