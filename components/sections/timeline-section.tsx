import coalDeepslateTexture from "@/assets/coal_deepslate.png";
import deepslateTexture from "@/assets/deepslate.png";
import diamondDeepslateTexture from "@/assets/diamond_deepslate.png";
import ironDeepslateTexture from "@/assets/iron_deepslate.png";
import { BlockSection } from "./block-section";

export function TimelineSection() {
  return (
    <BlockSection
      id="timeline"
      eyebrow="Deepslate Block"
      title="Timeline"
      texture={deepslateTexture}
      fallbackColor="#3a3a3e"
      oreTextures={[coalDeepslateTexture, ironDeepslateTexture, diamondDeepslateTexture]}
      seam={false}
    >
      <p
        className="text-sm text-white/80 md:text-base"
        style={{ fontFamily: "var(--font-minecraft), ui-monospace, 'Courier New', monospace" }}
      >
        Placeholder copy — the event-day schedule will be listed here.
      </p>
    </BlockSection>
  );
}
