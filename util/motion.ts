/**
 * Shared motion grammar. Scroll reveals, micro-interactions, and the pop
 * spring all pull from here so neighboring sections animate in step.
 * Set pieces (timeline haul, prizes unfurl, tracks sign swing) keep their
 * own longer timings on purpose.
 */

export const EASE = "easeOut" as const;

/** Hover states, tooltips, chevrons — anything that answers the pointer. */
export const DUR_MICRO = 0.15;
/** Standard scroll-into-view reveal. */
export const DUR_REVEAL = 0.5;
/** Cinematic set pieces that are meant to take a beat longer. */
export const DUR_SET_PIECE = 0.7;

/** Default whileInView viewport. */
export const VIEWPORT = { once: true, amount: 0.3 } as const;
/** For tall elements that would never reach 0.3 visibility on short phones. */
export const VIEWPORT_TALL = { once: true, amount: 0.2 } as const;

/** Snappy overshoot spring used by the sponsor slots (and the parked prize markers). */
export const POP_SPRING = { type: "spring", stiffness: 380, damping: 16 } as const;
