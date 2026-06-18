import dirtTexture from "@/assets/dirt.png";
import { BlockSection } from "./block-section";

export function AboutSection() {
  return (
    <BlockSection id="about" eyebrow="Dirt Block" title="About" texture={dirtTexture} fallbackColor="#7c4a2d" seam={false}>
      <p
        className="text-sm text-white/80 md:text-base"
        style={{ fontFamily: "var(--font-minecraft), ui-monospace, 'Courier New', monospace" }}
      >
        Placeholder copy — what InnoHacks 4.0 is, who it's for, and why you should show up.
      </p>
    </BlockSection>
  );
}
