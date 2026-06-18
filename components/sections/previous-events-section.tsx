import goldNetherTexture from "@/assets/gold_nether.png";
import netherrackTexture from "@/assets/netherrack.png";
import quartzTexture from "@/assets/quartz.png";
import { BlockSection } from "./block-section";

export function PreviousEventsSection() {
  return (
    <BlockSection
      id="previous-events"
      eyebrow="Netherrack Block"
      title="Previous Events"
      texture={netherrackTexture}
      fallbackColor="#5b2b2b"
      oreTextures={[goldNetherTexture, quartzTexture]}
      seam={false}
    >
      <p
        className="text-sm text-white/80 md:text-base"
        style={{ fontFamily: "var(--font-minecraft), ui-monospace, 'Courier New', monospace" }}
      >
        Placeholder copy — highlights from InnoHacks 1.0–3.0 will be listed here.
      </p>
    </BlockSection>
  );
}
