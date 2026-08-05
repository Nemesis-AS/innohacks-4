"use client";

import { motion } from "motion/react";
import { useHeaderFade } from "./use-header-fade";

const BADGE_HREF =
  "https://mlh.io/na?utm_source=na-hackathon&utm_medium=TrustBadge&utm_campaign=2026-season&utm_content=white";
const BADGE_SRC = "https://logged-assets.s3.amazonaws.com/trust-badge/2027/mlh-trust-badge-2027-white.svg";

/**
 * MLH-required trust badge. Rendered next to the nav bar rather than inside it, so the bar's
 * scroll fade can't drag it down on desktop, where MLH wants it parked top-right for the whole
 * page. On mobile there isn't room for that, so it tucks in just right of the bar's H mark — the
 * bar starts at 8px inset + 2px border + 16px padding and the mark is 25px wide at h-9, so 62px
 * clears it — and shares the bar's fade so the two arrive together. The `!` overrides opt back
 * out of that fade from md up.
 */
export function MlhTrustBadge() {
  const { opacity, pointerEvents } = useHeaderFade();

  return (
    <motion.a
      id="mlh-trust-badge"
      href={BADGE_HREF}
      target="_blank"
      rel="noreferrer"
      className="fixed left-[62px] top-0 z-[10000] block w-[60px] md:pointer-events-auto! md:left-auto md:right-[50px] md:w-[10%] md:opacity-100! md:min-w-[60px] md:max-w-[100px]"
      style={{ opacity, pointerEvents }}
    >
      <img src={BADGE_SRC} alt="Major League Hacking 2026 Hackathon Season" className="w-full" />
    </motion.a>
  );
}
