import dirtTexture from "@/assets/dirt.png";
import { BlockSection } from "./block-section";
import { QuestBoard } from "./quest-board";

const PIXEL_FONT = "var(--font-minecraft), ui-monospace, 'Courier New', monospace";

export function AboutSection() {
  return (
    <BlockSection id="about" texture={dirtTexture} fallbackColor="#7c4a2d" seam={false} align="left">
      <div className="grid w-full gap-10 md:grid-cols-2 md:items-center">
        <div
          className="flex flex-col gap-4 p-5"
          style={{
            backgroundColor: "#e8e6da",
            border: "3px solid #5c5848",
            boxShadow: "0 10px 0 rgba(0,0,0,0.3), 0 14px 28px rgba(0,0,0,0.35)",
          }}
        >
          <h2
            className="text-3xl uppercase md:text-5xl"
            style={{ color: "#2b2a1f", fontFamily: PIXEL_FONT, textShadow: "2px 2px 0 rgba(255,255,255,0.4)" }}
          >
            About
          </h2>
          <p className="text-sm text-[#2b2a1f]/80 md:text-base" style={{ fontFamily: PIXEL_FONT }}>
            Placeholder copy — what InnoHacks 4.0 is, who it's for, and why you should show up. A weekend of
            building, breaking, and shipping with a few hundred other people who'd rather make something than
            talk about making something.
          </p>
        </div>
        <QuestBoard />
      </div>
    </BlockSection>
  );
}
