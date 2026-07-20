import goldNetherTexture from "@/assets/gold_nether.png";
import netherrackTexture from "@/assets/netherrack.png";
import quartzTexture from "@/assets/quartz.png";
import { BlockSection } from "./block-section";
import { PictureFrame } from "./picture-frame";

const PIXEL_FONT =
  "var(--font-minecraft), ui-monospace, 'Courier New', monospace";

// Frames without a photo render a placeholder caption until the real image lands.
const PAST_EVENTS: { label: string; photo?: string; alt?: string }[] = [
  {
    label: "InnoHacks 3.0",
    photo:
      "https://res.cloudinary.com/dp6wx6vbg/image/upload/v1784566858/Innohacks_3.0_Logo-removebg-preview.dd5c4e14b3fba966fa1a_qozjav.png",
    alt: "InnoHacks 3.0 Logo",
  },
  {
    label: "NASA Space Apps Challenge Ghaziabad 2025",
    photo:
      "https://res.cloudinary.com/dp6wx6vbg/image/upload/v1784566700/NASA_Space_Apps_Icon_Cropped_cxypvf.png",
    alt: "NASA Space Apps Challenge Ghzaziabad 2025",
  },
  {
    label: "IWoC",
    photo:
      "https://res.cloudinary.com/dib0peewu/image/upload/v1743932084/iwoc_logo_front_badge_tmuope.png",
    alt: "IWOC Logo",
  },
];

export function PreviousEventsSection() {
  return (
    <BlockSection
      id="previous-events"
      title="Previous Events"
      texture={netherrackTexture}
      fallbackColor="#5b2b2b"
      oreTextures={[goldNetherTexture, quartzTexture]}
      seam={false}
      align="left"
      maxWidthClassName="max-w-4xl"
    >
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
        {PAST_EVENTS.map((event, index) => (
          <PictureFrame
            key={event.label}
            caption={event.label}
            delay={index * 0.15}
          >
            {event.photo ? (
              // Event photos aren't pixel art, so these render smoothly rather than pixelated.
              <img
                src={event.photo}
                alt={event.alt ?? event.label}
                className="h-full w-full object-contain"
              />
            ) : (
              <span
                className="text-center text-xs uppercase tracking-wide text-white/70"
                style={{
                  fontFamily: PIXEL_FONT,
                  textShadow: "1px 1px 0 rgba(0,0,0,0.8)",
                }}
              >
                Photo coming soon
              </span>
            )}
          </PictureFrame>
        ))}
      </div>
    </BlockSection>
  );
}
