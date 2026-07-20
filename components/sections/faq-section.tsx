import endStoneTexture from "@/assets/endstone.png";
import { Accordion, type AccordionGroup, FaqLink } from "./accordion";
import { BlockSection } from "./block-section";

/** Community links are not live yet — placeholder until the Discord invite exists. */
const DISCORD_URL = "#";

const FAQ_GROUPS: AccordionGroup[] = [
  {
    category: "Eligibility & Teams",
    items: [
      {
        question: "Who can participate?",
        answer:
          "The hackathon is open for students from all over India. It is the right place for anyone who's interested in learning and innovating with their ideas. Please note that teams should be from the same educational institution.",
      },
      {
        question: "Can we apply as a team?",
        answer:
          "Yes! We believe that you're stronger as a team than apart. You can form teams of 2-4 people. Most teams aim to have a mix of people with both design and development skills.",
      },
      {
        question: "Can I have team members from other colleges?",
        answer:
          "Unfortunately no, all the team members have to be from the same institution. The branch and year, however, can vary.",
      },
      {
        question: "What if I don't have a team?",
        answer: (
          <>
            No worries — head to the{" "}
            <FaqLink href={DISCORD_URL}>team-building channel</FaqLink> on our Discord and meet
            other hackers looking for teammates.
          </>
        ),
      },
      {
        question: "What if I don't know how to code?",
        answer:
          "No worries. Interest in learning and working with technology is much more important than your current experience level.",
      },
    ],
  },
  {
    category: "Format & Schedule",
    items: [
      {
        question: "How can I apply?",
        answer:
          'Registration is simply done by clicking the "Apply Now" button on the Devfolio hackathon page.',
      },
      {
        question: "How much will it cost?",
        answer:
          "Participation in InnoHacks 4.0 is free of cost. There is no participation fee.",
      },
      {
        question: "Is the hackathon online or offline?",
        answer: "The hackathon comprises two phases:",
        list: [
          "Ideation Phase: Online idea submission phase.",
          "Offline Hackathon: Shortlisted teams will be invited to an offline hackathon held on the 3rd & 4th of October 2026 on the KIET campus.",
        ],
      },
    ],
  },
  {
    category: "Building & Judging",
    items: [
      {
        question: "What are the problem statements?",
        answer:
          "We have four tracks you can choose to work on. The inclusion of open innovation creates an open stage for you to explore your own problem statements and build a solution on them:",
        list: [
          "IoT",
          "Agentic AI/GenAI",
          "Blockchain/Web3",
          "Open Innovation",
        ],
      },
      {
        question: "What can I build?",
        answer:
          "Possibly something that resonates with the theme of the event. It can be a website, software, an applet, or maybe even a piece of hardware. We'd love to see anything that solves a social problem or goes with our agenda.",
      },
      {
        question: "Can I start working on my hack before the event?",
        answer:
          "No. In the interest of fairness, students should not be working on their projects before the hackathon begins, and we do not allow participants to work on pre-existing projects. However, you can familiarise yourself with all the tools and technologies you intend to use beforehand.",
      },
      {
        question: "What are the prizes to be won?",
        answer: "Refer to the prizes section on the website.",
      },
    ],
  },
  {
    category: "Logistics & Support",
    items: [
      {
        question: "What facilities will be provided to the participants?",
        answer:
          "All participants will be provided with free accommodation and food services between the Opening Ceremony and the Closing Ceremony.",
      },
      {
        question:
          "Will KIET or Innogeeks carry the cost of travel for shortlisted teams?",
        answer:
          "KIET and/or Innogeeks bear no responsibility for your travel expenses towards the event. However, you can always approach your respective institutions for reimbursement — generally, it is completely covered.",
      },
      {
        question: "What if I have more queries?",
        answer: (
          <>
            Ask the organisers by raising a ticket or posting on the{" "}
            <FaqLink href={DISCORD_URL}>hacker-help-desk forum</FaqLink> on our Discord.
          </>
        ),
      },
    ],
  },
];

export function FaqSection() {
  return (
    <BlockSection
      id="faqs"
      title="FAQs"
      texture={endStoneTexture}
      fallbackColor="#dcd9a3"
      textColor="#2b2a1f"
      seam={false}
      align="left"
      maxWidthClassName="max-w-3xl"
    >
      <Accordion
        groups={FAQ_GROUPS}
        categoryColor="#2b2a1f"
        categoryPlate="rgba(247,244,214,0.82)"
      />
    </BlockSection>
  );
}
