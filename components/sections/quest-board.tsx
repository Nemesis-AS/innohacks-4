const PIXEL_FONT = "var(--font-minecraft), ui-monospace, 'Courier New', monospace";
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
    <div
      className="flex flex-col gap-4 p-5"
      style={{
        backgroundColor: "#6b4423",
        border: "3px solid #3a2615",
        boxShadow: "0 10px 0 rgba(0,0,0,0.3), 0 14px 28px rgba(0,0,0,0.35)",
      }}
    >
      <span
        className="text-center text-xs uppercase tracking-[0.3em] text-white/75 md:text-sm"
        style={{ fontFamily: PIXEL_FONT }}
      >
        Notice Board
      </span>

      {QUESTS.map((quest) => (
        <div
          key={quest.role}
          className="flex flex-col gap-2 p-3"
          style={{
            border: `2px solid ${quest.rarityColor}`,
            boxShadow: `inset 0 0 0 2px rgba(0,0,0,0.5)`,
            backgroundColor: "rgba(0,0,0,0.45)",
          }}
        >
          <span className="text-sm uppercase text-white md:text-base" style={{ fontFamily: PIXEL_FONT }}>
            {quest.icon} Quest: {quest.role}
          </span>
          <span className="text-xs text-white/70 md:text-sm" style={{ fontFamily: PIXEL_FONT }}>
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
