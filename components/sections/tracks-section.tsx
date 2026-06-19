import coalStoneTexture from "@/assets/coal_stone.png";
import copperStoneTexture from "@/assets/copper_stone.png";
import ironStoneTexture from "@/assets/iron_stone.png";
import stoneTexture from "@/assets/stone.png";
import { BlockSection } from "./block-section";

const PIXEL_FONT = "var(--font-minecraft), ui-monospace, 'Courier New', monospace";

type Track = {
  icon: string;
  name: string;
  color: string;
  description: string;
};

const TRACKS: Track[] = [
  { icon: "🧠", name: "AI/ML", color: "#4c3a8c", description: "Models, agents, and anything that learns from data." },
  { icon: "⛓️", name: "Web3", color: "#caa23a", description: "Decentralized apps, smart contracts, on-chain tooling." },
  { icon: "☁️", name: "Cloud", color: "#3b6fa6", description: "Scalable infra, serverless, and distributed systems." },
  { icon: "📡", name: "IoT", color: "#b5651d", description: "Hardware, sensors, and the devices that talk to each other." },
  { icon: "💡", name: "Open Innovation", color: "#4a7c4e", description: "Anything else — bring the idea, we'll bring the track." },
];

export function TracksSection() {
  return (
    <BlockSection
      id="tracks"
      title="Tracks"
      texture={stoneTexture}
      fallbackColor="#8a8a8a"
      oreTextures={[coalStoneTexture, copperStoneTexture, ironStoneTexture]}
      seam={false}
      maxWidthClassName="max-w-5xl"
    >
      <div className="grid w-full gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {TRACKS.map((track) => (
          <div
            key={track.name}
            className="flex flex-col gap-2 p-5 text-left"
            style={{
              backgroundColor: track.color,
              border: "3px solid rgba(0,0,0,0.4)",
              boxShadow: "0 8px 0 rgba(0,0,0,0.3), 0 12px 24px rgba(0,0,0,0.35)",
            }}
          >
            <span className="text-2xl">{track.icon}</span>
            <h3
              className="text-base uppercase text-white md:text-lg"
              style={{ fontFamily: PIXEL_FONT, textShadow: "2px 2px 0 rgba(0,0,0,0.35)" }}
            >
              {track.name}
            </h3>
            <p className="text-xs text-white/85 md:text-sm" style={{ fontFamily: PIXEL_FONT }}>
              {track.description}
            </p>
          </div>
        ))}
      </div>
    </BlockSection>
  );
}
