import { PixelChip } from "@/components/home-hero/minecraft-ui";
import { BlockSeam, seedFromId } from "./block-seam";
import { VoidNoiseBackground } from "./void-noise-background";

const SOCIAL_LINKS = [
  { label: "Instagram", href: "https://instagram.com/innogeeks" },
  { label: "LinkedIn", href: "https://linkedin.com/company/innogeeks" },
  { label: "X", href: "https://x.com/innogeeks" },
  { label: "Discord", href: "https://discord.gg/innogeeks" },
];

const PIXEL_FONT = "var(--font-minecraft), ui-monospace, 'Courier New', monospace";

export function VoidFooter() {
  return (
    <footer className="relative flex min-h-screen flex-col items-center justify-center gap-8 overflow-hidden px-6 py-24">
      <VoidNoiseBackground />
      <BlockSeam seed={seedFromId("void-footer")} color="#0a0a0e" />
      <div className="relative z-10 flex flex-col items-center gap-6 text-center">
        <h2
          className="text-2xl uppercase text-white md:text-3xl"
          style={{ fontFamily: PIXEL_FONT, textShadow: "3px 3px 0 rgba(0,0,0,0.5)" }}
        >
          InnoHacks 4.0
        </h2>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {SOCIAL_LINKS.map((link) => (
            <PixelChip key={link.label} href={link.href}>
              {link.label}
            </PixelChip>
          ))}
        </div>
      </div>
    </footer>
  );
}
