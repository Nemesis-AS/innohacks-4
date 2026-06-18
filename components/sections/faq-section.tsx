import endStoneTexture from "@/assets/endstone.png";
import { BlockSection } from "./block-section";

export function FaqSection() {
  return (
    <BlockSection
      id="faqs"
      eyebrow="End Stone Block"
      title="FAQs"
      texture={endStoneTexture}
      fallbackColor="#dcd9a3"
      textColor="#2b2a1f"
      seam={false}
    >
      <p
        className="text-sm text-[#2b2a1f]/80 md:text-base"
        style={{ fontFamily: "var(--font-minecraft), ui-monospace, 'Courier New', monospace" }}
      >
        Placeholder copy — frequently asked questions will be listed here.
      </p>
    </BlockSection>
  );
}
