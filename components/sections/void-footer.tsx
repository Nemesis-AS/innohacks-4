"use client";

import { useLenis } from "lenis/react";
import type { MouseEvent } from "react";
import bedrockTexture from "@/assets/bedrock.png";
import logoImg from "@/assets/logo.png";
import { AdvancementToast } from "./advancement-toast";
import { SocialLinks } from "./social-links";
import { VoidNoiseBackground } from "./void-noise-background";

const PIXEL_FONT =
  "var(--font-minecraft), ui-monospace, 'Courier New', monospace";

// Placeholder venue lines — confirm the exact street address before launch.
const VENUE = [
  "KIET Deemed to be University",
  "Delhi-Meerut Road, Ghaziabad",
  "Uttar Pradesh 201206, India",
];
const VENUE_MAP_URL = "https://maps.app.goo.gl/e5pt4dcFpn7SivZr5";

const CONTACTS = [
  { label: "innohacks@innogeeks.in", href: "mailto:innogeeks@kiet.edu" },
];

const QUICK_LINKS = [
  {
    label: "Sponsorship Brochure",
    href: "/innohacks-4-brochure.pdf",
    newTab: true,
  },
  { label: "About Innogeeks", href: "https://innogeeks.in", newTab: true },
  { label: "Code of Conduct", href: "/code-of-conduct.pdf", newTab: true },
  { label: "FAQs", href: "#faqs" },
];

function ColumnHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3
      className="text-xs uppercase tracking-[0.2em] text-white md:text-sm"
      style={{
        fontFamily: PIXEL_FONT,
        textShadow: "2px 2px 0 rgba(0,0,0,0.5)",
      }}
    >
      {children}
    </h3>
  );
}

export function VoidFooter() {
  const lenis = useLenis();

  // Lenis owns the scroll position, so a native hash jump lands hard. Route
  // in-page links through it the same way the header nav does.
  const handleHashClick = (
    event: MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    if (!href.startsWith("#")) return;
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
    <footer className="relative flex flex-col items-center justify-center gap-12 overflow-hidden px-6 py-12 md:py-20">
      <VoidNoiseBackground />

      <div className="relative z-10 grid w-full max-w-6xl gap-12 md:grid-cols-3 md:items-start md:gap-8">
        {/* Left: identity and venue. */}
        <div className="flex flex-col items-center gap-4 text-center md:items-start md:text-left">
          <img src={logoImg.src} alt="InnoHacks 4.0" className="h-10 w-auto md:h-12" />
          <address className="flex flex-col gap-1 not-italic">
            {VENUE.map((line) => (
              <span
                key={line}
                className="text-xs text-white/70 md:text-sm"
                style={{ fontFamily: PIXEL_FONT }}
              >
                {line}
              </span>
            ))}
            <a
              href={VENUE_MAP_URL}
              target="_blank"
              rel="noreferrer noopener"
              className="mt-1 text-xs text-white/70 underline underline-offset-4 transition-colors hover:text-white md:text-sm"
              style={{ fontFamily: PIXEL_FONT }}
            >
              View on Google Maps
            </a>
          </address>
        </div>

        {/* Center: the reward for scrolling the whole way down, plus socials. */}
        <div className="flex flex-col items-center gap-6">
          <AdvancementToast
            name="The Bottom of the World"
            icon={bedrockTexture}
          />
          <SocialLinks />
        </div>

        {/* Right: contact and quick links. */}
        <div className="flex flex-col items-center gap-8 text-center md:items-end md:text-right">
          <div className="flex flex-col items-center gap-3 md:items-end">
            <ColumnHeading>Contact Us</ColumnHeading>
            <div className="flex flex-col gap-1.5">
              {CONTACTS.map((contact) => (
                <a
                  key={contact.label}
                  href={contact.href}
                  className="text-xs text-white/70 transition-colors hover:text-white md:text-sm"
                  style={{ fontFamily: PIXEL_FONT }}
                >
                  {contact.label}
                </a>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center gap-3 md:items-end">
            <ColumnHeading>Quick Links</ColumnHeading>
            <nav className="flex flex-col gap-1.5">
              {QUICK_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(event) => handleHashClick(event, link.href)}
                  {...(link.newTab
                    ? { target: "_blank", rel: "noreferrer noopener" }
                    : {})}
                  className="text-xs text-white/70 transition-colors hover:text-white md:text-sm"
                  style={{ fontFamily: PIXEL_FONT }}
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>
        </div>
      </div>

      <div className="relative z-10 w-full max-w-6xl border-t border-white/10 pt-6">
        <p
          className="text-center text-[10px] uppercase tracking-[0.15em] text-white/45 md:text-xs"
          style={{ fontFamily: PIXEL_FONT }}
        >
          © 2026 Innogeeks · KIET Deemed to be University
        </p>
      </div>
    </footer>
  );
}
