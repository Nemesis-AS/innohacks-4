/**
 * Single source of truth for the facts that appear in metadata, the OG card, and
 * structured data. Keep these in sync with what the page itself renders.
 */
export const EVENT = {
  name: "InnoHacks 4.0",
  organizer: "Innogeeks",
  /** Human-readable form used in copy and on the OG card. */
  dates: "Oct 2–3, 2026",
  /** ISO 8601, for schema.org. */
  startDate: "2026-10-02",
  endDate: "2026-10-03",
  venue: {
    name: "KIET Deemed to be University",
    street: "Delhi-Meerut Road",
    city: "Ghaziabad",
    region: "Uttar Pradesh",
    postalCode: "201206",
    country: "IN",
  },
  url: "https://innohacks.live",
  email: "innohacks@innogeeks.in",
  socials: [
    "https://instagram.com/innogeeks",
    "https://linkedin.com/company/innogeeks",
    "https://x.com/innogeeks",
    "https://discord.gg/innogeeks",
  ],
} as const;
