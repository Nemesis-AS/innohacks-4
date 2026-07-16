import type { Metadata, Viewport } from "next";
import { Caveat, Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import { Header } from "@/components/header";
import { EVENT } from "@/util/event";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const minecraft = localFont({
  src: [
    { path: "../assets/fonts/Minecraft.otf", weight: "400", style: "normal" },
    { path: "../assets/fonts/Minecraft-Bold.otf", weight: "700", style: "normal" },
  ],
  variable: "--font-minecraft",
});

const handwriting = Caveat({
  variable: "--font-handwriting",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const DESCRIPTION = `${EVENT.organizer} presents ${EVENT.name}, a 24-hour student hackathon at ${EVENT.venue.name}, ${EVENT.venue.city}, on ${EVENT.dates}. Build in teams of 2-4, ship something real, and win your way up the leaderboard.`;

export const metadata: Metadata = {
  // Resolves the relative OG/Twitter image and canonical URLs into the absolute
  // ones social scrapers require.
  metadataBase: new URL(EVENT.url),
  title: {
    default: `${EVENT.name}`,
    template: `%s · ${EVENT.name}`,
  },
  description: DESCRIPTION,
  applicationName: EVENT.name,
  keywords: [
    EVENT.name,
    "InnoHacks",
    "Innogeeks",
    "hackathon",
    "student hackathon",
    "KIET",
    "KIET Deemed to be University",
    "Ghaziabad",
    "Delhi NCR hackathon",
    "coding competition",
    "hackathon 2026",
  ],
  authors: [{ name: EVENT.organizer, url: "https://innogeeks.in" }],
  creator: EVENT.organizer,
  publisher: EVENT.organizer,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: EVENT.name,
    url: "/",
    title: `${EVENT.name} — ${EVENT.dates}`,
    description: DESCRIPTION,
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    site: "@innogeeks",
    creator: "@innogeeks",
    title: `${EVENT.name} — ${EVENT.dates}`,
    description: DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  category: "technology",
};

export const viewport: Viewport = {
  // Matches the hero's opening noon sky, so mobile browser chrome blends into the page.
  themeColor: "#83a5f0",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${minecraft.variable} ${handwriting.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Header />
        {children}
      </body>
    </html>
  );
}
