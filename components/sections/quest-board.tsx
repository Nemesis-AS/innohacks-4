import { MinecraftButton } from "@/components/minecraft-ui";

const PIXEL_FONT = "var(--font-minecraft), ui-monospace, 'Courier New', monospace";
const INK = "#3a2a17";
const CONTACT_EMAIL = "innogeeks@kiet.edu";

type Quest = {
  icon: string;
  role: string;
  reward: string;
  /** Minecraft item-rarity colors: uncommon (yellow), rare (aqua), epic (purple). */
  rarityColor: string;
  /** Dark shade of rarityColor, for the button's bevel frame. */
  borderColor: string;
  subject: string;
};

/** Seconds between each button's glint, so the three sweep in sequence rather than in lockstep. */
const GLINT_STAGGER = 1.4;

const QUESTS: Quest[] = [
  {
    icon: "📦",
    role: "Sponsor",
    reward: "Reward: brand exposure to 300+ builders",
    rarityColor: "#fbbf24",
    borderColor: "#7a4f05",
    subject: "Sponsor Inquiry — InnoHacks 4.0",
  },
  {
    icon: "⚖",
    role: "Judge",
    reward: "Reward: front-row seat to the best ideas",
    rarityColor: "#22d3ee",
    borderColor: "#0b5f6e",
    subject: "Judge Inquiry — InnoHacks 4.0",
  },
  {
    icon: "🤝",
    role: "Partner",
    reward: "Reward: co-branded reach & community access",
    rarityColor: "#c084fc",
    borderColor: "#5b2d80",
    subject: "Partner Inquiry — InnoHacks 4.0",
  },
];

export function QuestBoard() {
  return (
    <div className="flex h-full flex-col gap-4">
      <span
        className="text-center text-sm uppercase tracking-[0.3em] md:text-base"
        style={{ fontFamily: PIXEL_FONT, color: INK, fontWeight: 700 }}
      >
        Notice Board
      </span>

      {QUESTS.map((quest, index) => (
        <div
          key={quest.role}
          className={`flex flex-col gap-2 pb-4 ${index < QUESTS.length - 1 ? "border-b border-dashed" : ""}`}
          style={{ borderColor: `${INK}40` }}
        >
          <span className="text-lg md:text-xl" style={{ fontFamily: PIXEL_FONT, color: INK, fontWeight: 600 }}>
            {quest.icon} Quest: {quest.role}
          </span>
          <span className="text-base md:text-lg" style={{ fontFamily: PIXEL_FONT, color: `${INK}cc` }}>
            {quest.reward}
          </span>
          {/* Three links all reading "Accept Quest" are useless when tabbing or listing
              links, so the role rides along in the aria-label while the visible text
              stays on-theme. */}
          <MinecraftButton
            href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(quest.subject)}`}
            color={quest.rarityColor}
            borderColor={quest.borderColor}
            textColor="#1a1206"
            glint
            glintDelay={index * GLINT_STAGGER}
            aria-label={`Accept quest: become a ${quest.role.toLowerCase()}`}
            className="mt-1 w-full px-5 py-3 text-sm md:text-base"
          >
            Accept Quest <span aria-hidden>→</span>
          </MinecraftButton>
        </div>
      ))}
    </div>
  );
}
