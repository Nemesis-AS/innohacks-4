"use client";

import { useLenis } from "lenis/react";
import { AnimatePresence, motion, useScroll, useTransform } from "motion/react";
import { useEffect, useState, type MouseEvent } from "react";
import dirtTexture from "@/assets/dirt.png";
import grassTexture from "@/assets/grass.png";
import logoMarkImg from "@/assets/logo-mark.png";

const PIXEL_FONT = "var(--font-minecraft), ui-monospace, 'Courier New', monospace";
const GRASS_TILE = 16;
const GRASS_CAP_HEIGHT = 10;
const DIRT_TILE = 32;
const FADE_DISTANCE = 240;

const NAV_LINKS = [
  { label: "About", href: "#about" },
  { label: "Tracks", href: "#tracks" },
  { label: "Timeline", href: "#timeline" },
  { label: "Sponsors", href: "#sponsors" },
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
    setIsMenuOpen(false);
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
            borderBottom: isMenuOpen ? "none" : "2px solid #1f2e14",
            borderRadius: isMenuOpen ? "0" : "0 0 14px 14px",
            boxShadow: "0 10px 28px rgba(0,0,0,0.4)",
          }}
        >
          <a
            href="#hero"
            onClick={(event) => handleNavClick(event, "#hero")}
            className="flex shrink-0 select-none items-center"
          >
            {/* Just the H mark here — the full wordmark is right below in the hero. The mark is
                dirt-and-stone on a dirt bar, so it needs the dark halo to hold its silhouette. */}
            <img
              src={logoMarkImg.src}
              alt="InnoHacks 4.0"
              className="h-9 w-auto md:h-10"
              style={{
                filter:
                  "drop-shadow(0 1px 0 rgba(0,0,0,0.85)) drop-shadow(0 0 1px rgba(0,0,0,0.85)) drop-shadow(0 0 3px rgba(0,0,0,0.5))",
              }}
            />
          </a>
          <nav className="hidden items-center gap-1.5 md:flex">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(event) => handleNavClick(event, link.href)}
                className="px-3 py-1.5 text-xs uppercase tracking-[0.15em] text-white/85 transition-colors hover:text-white"
                style={{ fontFamily: PIXEL_FONT, textShadow: "1px 1px 0 rgba(0,0,0,0.6)" }}
              >
                {link.label}
              </a>
            ))}
          </nav>
          <button
            type="button"
            onClick={() => setIsMenuOpen((open) => !open)}
            aria-expanded={isMenuOpen}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            className="flex shrink-0 flex-col items-center justify-center gap-1.5 p-2 md:hidden"
          >
            <span
              className="block h-[2px] w-5 bg-white/85 transition-transform"
              style={{ transform: isMenuOpen ? "translateY(8px) rotate(45deg)" : "none" }}
            />
            <span
              className="block h-[2px] w-5 bg-white/85 transition-opacity"
              style={{ opacity: isMenuOpen ? 0 : 1 }}
            />
            <span
              className="block h-[2px] w-5 bg-white/85 transition-transform"
              style={{ transform: isMenuOpen ? "translateY(-8px) rotate(-45deg)" : "none" }}
            />
          </button>
        </div>
        <AnimatePresence initial={false}>
          {isMenuOpen && (
            <motion.div
              key="mobile-nav"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="overflow-hidden md:hidden"
              style={{
                backgroundImage: `url(${dirtTexture.src})`,
                backgroundSize: `${DIRT_TILE}px ${DIRT_TILE}px`,
                backgroundRepeat: "repeat",
                imageRendering: "pixelated",
                borderLeft: "2px solid #1f2e14",
                borderRight: "2px solid #1f2e14",
                borderBottom: "2px solid #1f2e14",
                borderRadius: "0 0 14px 14px",
                boxShadow: "0 10px 28px rgba(0,0,0,0.4)",
              }}
            >
              <nav className="flex flex-col px-4 py-2">
                {NAV_LINKS.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={(event) => handleNavClick(event, link.href)}
                    className="border-t border-white/10 px-2 py-2.5 text-[11px] uppercase tracking-[0.15em] text-white/85 transition-colors first:border-t-0 hover:text-white"
                    style={{ fontFamily: PIXEL_FONT, textShadow: "1px 1px 0 rgba(0,0,0,0.6)" }}
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}
