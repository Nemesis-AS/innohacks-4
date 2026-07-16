const PIXEL_FONT = "var(--font-minecraft), ui-monospace, 'Courier New', monospace";
const INK = "#3a2a17";
const CONTACT_EMAIL = "team@innohacks.example"; // TODO: replace with real contact address

type Quest = {
  icon: string;
  role: string;
  reward: string;
  /** Minecraft item-rarity colors: uncommon (yellow), rare (aqua), epic (purple). */
  rarityColor: string;
  subject: string;
};

const QUESTS: Quest[] = [
  {
    icon: "📦",
    role: "Sponsor",
    reward: "Reward: brand exposure to 300+ builders",
    rarityColor: "#fbbf24",
    subject: "Sponsor Inquiry — InnoHacks 4.0",
  },
  {
    icon: "⚖",
    role: "Judge",
    reward: "Reward: front-row seat to the best ideas",
    rarityColor: "#22d3ee",
    subject: "Judge Inquiry — InnoHacks 4.0",
  },
  {
    icon: "🤝",
    role: "Partner",
    reward: "Reward: co-branded reach & community access",
    rarityColor: "#c084fc",
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
          className={`flex flex-col gap-1.5 pb-3 ${index < QUESTS.length - 1 ? "border-b border-dashed" : ""}`}
          style={{ borderColor: `${INK}40` }}
        >
          <span className="text-lg md:text-xl" style={{ fontFamily: PIXEL_FONT, color: INK, fontWeight: 600 }}>
            {quest.icon} Quest: {quest.role}
          </span>
          <span className="text-base md:text-lg" style={{ fontFamily: PIXEL_FONT, color: `${INK}cc` }}>
            {quest.reward}
          </span>
          <a
            href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(quest.subject)}`}
            className="self-start px-3 py-1 text-xs uppercase text-black transition-transform hover:-translate-y-0.5 md:text-sm"
            style={{ fontFamily: PIXEL_FONT, backgroundColor: quest.rarityColor }}
          >
            Accept Quest
          </a>
        </div>
      ))}
    </div>
  );
}
