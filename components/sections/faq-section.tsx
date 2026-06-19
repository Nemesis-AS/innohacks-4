import endStoneTexture from "@/assets/endstone.png";
import { Accordion, type AccordionItem } from "./accordion";
import { BlockSection } from "./block-section";

// Placeholder Q&A — swap with the real FAQ copy once finalized.
const FAQS: AccordionItem[] = [
  { question: "Who can participate?", answer: "Any student team of 2-4 members can register for InnoHacks 4.0." },
  { question: "Is there a registration fee?", answer: "No, participation is completely free." },
  { question: "Do I need a team beforehand?", answer: "No — solo registrants can form or join a team at the event." },
  { question: "What should I bring?", answer: "Your laptop, charger, a valid ID, and any hardware your project needs." },
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
      <Accordion items={FAQS} />
    </BlockSection>
  );
}
