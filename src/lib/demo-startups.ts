import type { FeaturedCarouselItem } from "@/lib/api";

/**
 * Well-known companies for demo / filler cards (public facts only).
 * `visits` are illustrative for layout, not real metrics.
 */
export type DemoStartupRecord = {
  name: string;
  shortSummary: string;
  longSummary: string;
  websiteUrl: string;
  visits: number;
  valuation: string;
};

export const DEMO_STARTUP_RECORDS: DemoStartupRecord[] = [
  {
    name: "Stripe",
    shortSummary: "Payments and financial infrastructure for the internet.",
    longSummary:
      "Stripe helps millions of companies accept payments, send payouts, and manage revenue online and in person. Developers use its APIs to integrate checkout, billing, and more into their products.",
    websiteUrl: "https://stripe.com",
    visits: 42000000,
    valuation: "Privately held",
  },
  {
    name: "Notion",
    shortSummary: "All-in-one workspace for notes, docs, and team wikis.",
    longSummary:
      "Notion combines notes, tasks, wikis, and databases so teams can write, plan, and collaborate in one place. It is widely used by startups and enterprises for internal knowledge and project tracking.",
    websiteUrl: "https://www.notion.so",
    visits: 28000000,
    valuation: "Privately held",
  },
  {
    name: "Linear",
    shortSummary: "Issue tracking and product development for software teams.",
    longSummary:
      "Linear streamlines issue tracking, sprints, and roadmaps with a fast, keyboard-driven UI. It is built for engineering and product teams that want clarity from idea to release.",
    websiteUrl: "https://linear.app",
    visits: 9200000,
    valuation: "Privately held",
  },
  {
    name: "Vercel",
    shortSummary: "Frontend cloud platform for Next.js and modern web apps.",
    longSummary:
      "Vercel provides hosting, previews, and edge infrastructure for frameworks like Next.js. Teams ship static and dynamic sites with automatic scaling and global CDN delivery.",
    websiteUrl: "https://vercel.com",
    visits: 35000000,
    valuation: "Privately held",
  },
  {
    name: "Figma",
    shortSummary: "Collaborative interface design in the browser.",
    longSummary:
      "Figma is a collaborative UI design tool used for product design, prototyping, and design systems. Teams co-edit files in real time and hand off specs to engineering.",
    websiteUrl: "https://www.figma.com",
    visits: 55000000,
    valuation: "Adobe",
  },
  {
    name: "Anthropic",
    shortSummary: "AI research and products, including the Claude assistant.",
    longSummary:
      "Anthropic focuses on building reliable, steerable AI systems. Its Claude models power assistants and APIs used by businesses for coding, writing, and analysis.",
    websiteUrl: "https://www.anthropic.com",
    visits: 18000000,
    valuation: "Privately held",
  },
  {
    name: "Supabase",
    shortSummary: "Open-source Firebase alternative: Postgres, auth, and storage.",
    longSummary:
      "Supabase offers a hosted Postgres database, authentication, real-time subscriptions, and file storage so developers can build backends quickly with familiar SQL tooling.",
    websiteUrl: "https://supabase.com",
    visits: 14000000,
    valuation: "Privately held",
  },
  {
    name: "Duolingo",
    shortSummary: "Mobile and web app for learning languages through bite-sized lessons.",
    longSummary:
      "Duolingo gamifies language learning with short daily lessons, streaks, and adaptive difficulty. It offers dozens of languages and is one of the most downloaded education apps worldwide.",
    websiteUrl: "https://www.duolingo.com",
    visits: 95000000,
    valuation: "Public (NASDAQ: DUOL)",
  },
  {
    name: "Airbnb",
    shortSummary: "Global marketplace for short-term stays and experiences.",
    longSummary:
      "Airbnb connects guests with hosts offering homes, rooms, and experiences. Travelers book unique stays worldwide while hosts earn income from their properties.",
    websiteUrl: "https://www.airbnb.com",
    visits: 110000000,
    valuation: "Public (NASDAQ: ABNB)",
  },
  {
    name: "Shopify",
    shortSummary: "Commerce platform for online stores and retail point of sale.",
    longSummary:
      "Shopify lets merchants build storefronts, manage inventory, accept payments, and sell across channels. It powers millions of businesses from solo founders to large brands.",
    websiteUrl: "https://www.shopify.com",
    visits: 72000000,
    valuation: "Public (NYSE: SHOP)",
  },
  {
    name: "Cursor",
    shortSummary: "AI-native code editor built for pair-programming with models.",
    longSummary:
      "Cursor is a fork of VS Code-style editing with integrated AI for autocomplete, chat, and refactors. Developers use it to write and navigate code faster with model assistance.",
    websiteUrl: "https://cursor.com",
    visits: 11000000,
    valuation: "Privately held",
  },
  {
    name: "Miro",
    shortSummary: "Online whiteboard for brainstorming, workshops, and agile rituals.",
    longSummary:
      "Miro provides infinite canvases for sticky notes, diagrams, and templates. Distributed teams run retros, journey maps, and planning sessions asynchronously or live.",
    websiteUrl: "https://miro.com",
    visits: 22000000,
    valuation: "Privately held",
  },
];

export function hostKeyFromUrl(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./i, "").toLowerCase();
  } catch {
    return "";
  }
}

/** Drop demo rows whose site already has a live SANDBOX review. */
export function filterDemosNotCoveredByLive<
  T extends { websiteUrl: string },
  L extends { url: string },
>(demos: T[], live: L[]): T[] {
  const liveHosts = new Set(live.map((i) => hostKeyFromUrl(i.url)));
  return demos.filter((d) => !liveHosts.has(hostKeyFromUrl(d.websiteUrl)));
}

export type GalleryCardRow = {
  key: string;
  name: string;
  summary: string;
  visits: number;
  valuation: string;
  websiteUrl: string;
  feedbackHref?: string;
};

export function mergeGalleryRows(
  live: FeaturedCarouselItem[],
  demos: DemoStartupRecord[]
): GalleryCardRow[] {
  const demosFiltered = filterDemosNotCoveredByLive(demos, live);

  const fromLive: GalleryCardRow[] = live.map((i) => ({
    key: `live-${i.id}`,
    name: i.name,
    summary: i.summaryLong ?? i.summary,
    visits: i.visits,
    valuation: i.valuation,
    websiteUrl: i.url,
    feedbackHref: `/feedback/${i.id}`,
  }));

  const fromDemo: GalleryCardRow[] = demosFiltered.map((d, idx) => ({
    key: `demo-${d.name}-${idx}`,
    name: d.name,
    summary: d.longSummary,
    visits: d.visits,
    valuation: d.valuation,
    websiteUrl: d.websiteUrl,
  }));

  return [...fromLive, ...fromDemo];
}
