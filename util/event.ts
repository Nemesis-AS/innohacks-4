/**
 * Single source of truth for the facts that appear in metadata, the OG card, and
 * structured data. Keep these in sync with what the page itself renders.
 */
export const EVENT = {
  name: "InnoHacks 4.0",
  organizer: "Innogeeks",
  /** Human-readable form used in copy and on the OG card. */
  dates: "Oct 3–4, 2026",
  /** ISO 8601, for schema.org. */
  startDate: "2026-10-03",
  endDate: "2026-10-04",
  venue: {
    name: "KIET Deemed to be University",
    street: "Delhi-Meerut Road",
    city: "Ghaziabad",
    region: "Uttar Pradesh",
    postalCode: "201206",
    country: "IN",
  },
  url: "https://innohacks.live",
  email: "innogeeks@kiet.edu",
  socials: [
    "https://instagram.com/innogeeks",
    "https://linkedin.com/company/innogeeks",
    "https://x.com/innogeeks",
    "https://discord.gg/YFcK3TnnM8",
  ],
} as const;
