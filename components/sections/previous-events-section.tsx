import goldNetherTexture from "@/assets/gold_nether.png";
import netherrackTexture from "@/assets/netherrack.png";
import quartzTexture from "@/assets/quartz.png";
import { BlockSection } from "./block-section";
import { PictureFrame } from "./picture-frame";

const PIXEL_FONT = "var(--font-minecraft), ui-monospace, 'Courier New', monospace";

// Placeholder captions — swap frame contents for real event photos once available.
const PAST_EVENTS = ["InnoHacks 1.0", "InnoHacks 2.0", "InnoHacks 3.0"];

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
        {PAST_EVENTS.map((label, index) => (
          <PictureFrame key={label} caption={label} delay={index * 0.15}>
            <span className="text-xs uppercase text-white/40" style={{ fontFamily: PIXEL_FONT }}>
              Photo coming soon
            </span>
          </PictureFrame>
        ))}
      </div>
    </BlockSection>
  );
}
