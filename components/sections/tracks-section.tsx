import coalStoneTexture from "@/assets/coal_stone.png";
import copperStoneTexture from "@/assets/copper_stone.png";
import ironStoneTexture from "@/assets/iron_stone.png";
import stoneTexture from "@/assets/stone.png";
import { BlockSection } from "./block-section";

export function TracksSection() {
  return (
    <BlockSection
      id="tracks"
      eyebrow="Stone Block"
      title="Tracks"
      texture={stoneTexture}
      fallbackColor="#8a8a8a"
      oreTextures={[coalStoneTexture, copperStoneTexture, ironStoneTexture]}
      seam={false}
    >
      <p
        className="text-sm text-white/80 md:text-base"
        style={{ fontFamily: "var(--font-minecraft), ui-monospace, 'Courier New', monospace" }}
      >
        Placeholder copy — the hackathon tracks/themes will be listed here.
      </p>
    </BlockSection>
  );
}
