export type ReviewTargetKind = "website" | "google_play" | "apple_app_store";

const SOCIAL_HOSTS = new Set([
  // Social / media
  "facebook.com",
  "m.facebook.com",
  "fb.me",
  "instagram.com",
  "m.instagram.com",
  "youtube.com",
  "m.youtube.com",
  "youtu.be",
  "tiktok.com",
  "twitter.com",
  "x.com",
  "t.co",
  "linkedin.com",
  "www.linkedin.com",
  "reddit.com",
  "www.reddit.com",
  "pinterest.com",
  "medium.com",
  "quora.com",
  "twitch.tv",
  "discord.com",
  "www.discord.com",
  "snapchat.com",
  "snapchat.com",
  "whatsapp.com",
  "web.whatsapp.com",
  "telegram.me",
  "t.me",
  "trending",
  // Portfolio / communities often (best-effort, keep narrow)
  "linktr.ee",
]);

const PLAY_HOST = "play.google.com";
const APPLE_HOSTS = new Set(["apps.apple.com", "itunes.apple.com"]);

const PATH_BLOCK_TOKENS: Array<RegExp> = [
  // Personal portfolio / CV
  /\/(portfolio|resume|cv|curriculum-vitae|curriculum_vitae|about-me|aboutme|my-|me|personal|projects|work)\b/i,
  /\/(curriculum-vitae|curriculum_vitae)\b/i,
  /\/(freelance|consultant|consulting|contractor|speaker|speaking)\b/i,
  // University / clubs / students
  /\/(university|college|campus|students|student|faculty|department|admissions|club|clubs|society|chapter|alumni)\b/i,
  // Video/content pages (even if host isn’t blocked)
  /\/(watch|channel|@|shorts|live|playlist|podcast|episode)\b/i,
];

export function classifyReviewTarget(canonicalUrl: string): ReviewTargetKind | null {
  let u: URL;
  try {
    u = new URL(canonicalUrl);
  } catch {
    return null;
  }
  const host = u.hostname.toLowerCase();
  if (host === PLAY_HOST) return "google_play";
  if (APPLE_HOSTS.has(host)) return "apple_app_store";
  return "website";
}

export function getReviewTargetRejectionReason(
  canonicalUrl: string
): string | null {
  let u: URL;
  try {
    u = new URL(canonicalUrl);
  } catch {
    return "Invalid URL";
  }

  const host = u.hostname.toLowerCase();
  const kind = classifyReviewTarget(canonicalUrl);

  // Play store listing allow (we still block if someone tries to paste a random play page).
  if (kind === "google_play") {
    const path = u.pathname || "";
    const ok = path.startsWith("/store/apps/details") && !!u.searchParams.get("id");
    return ok ? null : "Unsupported Google Play link. Paste the app details URL from the Play Store.";
  }

  // Apple allow for numeric app links.
  if (kind === "apple_app_store") {
    const path = u.pathname || "";
    const ok = /\/app\/.+\/id\d{6,}/i.test(path);
    return ok ? null : "Unsupported App Store link. Paste the official app URL with the numeric id.";
  }

  // Block social / profiles / media pages.
  if (SOCIAL_HOSTS.has(host)) {
    return "Unsupported link type. Please paste a startup/company website or an official app store listing (not social profiles).";
  }

  // Block obvious educational/club content.
  if (host.endsWith(".edu")) {
    return "Unsupported link type. University/education pages are not supported. Please paste a startup/company website.";
  }

  // Block by path tokens.
  const path = u.pathname || "/";
  for (const re of PATH_BLOCK_TOKENS) {
    if (re.test(path)) {
      return "Unsupported link type. Portfolio/CV/personal pages, universities, and clubs are not supported. Please paste a startup/company website or official app store listing.";
    }
  }

  // If we got here, allow (best-effort; deeper checks happen in the memo itself).
  return null;
}

function pickFirstMatch(source: string, re: RegExp): string {
  const m = source.match(re);
  return (m?.[1] || "").trim();
}

function looksLikePersonalPortfolioFromHtml(
  html: string
): { reject: boolean; reason: string } {
  const title = pickFirstMatch(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
  const metaDescription = pickFirstMatch(
    html,
    /<meta[^>]+name=["']description["'][^>]+content=["']([\s\S]*?)["'][^>]*>/i
  );
  const h1 = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)]
    .slice(0, 5)
    .map((m) => (m[1] || "").trim())
    .filter(Boolean);

  const lower = html.toLowerCase();

  const personalTokens = [
    "portfolio",
    "resume",
    "cv",
    "curriculum vitae",
    "about me",
    "contact me",
    "linkedin contributions",
    "view all posts on linkedin",
    "youtube channel",
    "watch on youtube",
    "subscribe",
  ];

  const businessTokens = [
    "company",
    "startup",
    "product",
    "pricing",
    "solutions",
    "services",
    "team",
    "investors",
    "founders",
  ];

  let personalScore = 0;
  for (const t of personalTokens) {
    if (lower.includes(t)) personalScore += 1;
  }

  let businessScore = 0;
  for (const t of businessTokens) {
    if (lower.includes(t)) businessScore += 1;
  }

  // Example: "Md Sifat Bin Jibon | Blockchain Developer in Bangladesh | ..."
  const nameLikeTitle = /^[A-Z][a-z]+(?: [A-Z][a-z]+){1,5}\s*(\||-)/.test(title || "");
  const roleLike = /(developer|engineer|designer|blockchain|ceo|founder|programmer|freelancer)/i.test(
    [title, metaDescription, ...h1].join(" ")
  );

  // Reject when the page strongly resembles a personal portfolio/CV AND it doesn't look like a product/company.
  if (personalScore >= 2 && businessScore <= 1) {
    return {
      reject: true,
      reason:
        "This link looks like a personal portfolio/CV site. Please paste the startup/company official website (or an official Play/App Store listing).",
    };
  }

  if (nameLikeTitle && roleLike && personalScore >= 1 && businessScore <= 1) {
    return {
      reject: true,
      reason:
        "This link looks like a personal profile/portfolio (name + role). Please paste the startup/company official website (or an official Play/App Store listing).",
    };
  }

  // If we have strong personal signals but also decent business tokens, allow (to avoid false positives).
  return { reject: false, reason: "" };
}

/**
 * Evidence-based validator for website URLs.
 * - fast HTML fetch with timeout
 * - rejects obvious personal portfolio/CV pages
 * - allows on fetch failure (we don't want to block real startups due to fetch issues)
 */
export async function getReviewTargetRejectionReasonWithEvidence(
  canonicalUrl: string
): Promise<string | null> {
  const immediate = getReviewTargetRejectionReason(canonicalUrl);
  if (immediate) return immediate;

  const kind = classifyReviewTarget(canonicalUrl);
  if (kind !== "website") return null; // app stores already handled by deterministic rules

  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), 4_500);
  try {
    const res = await fetch(canonicalUrl, {
      method: "GET",
      redirect: "follow",
      signal: ac.signal,
      headers: {
        // Use a browser-like UA so we get the real HTML for portfolio sites
        // (many personal sites serve different content to bots).
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });
    if (!res.ok) return null;
    const ct = (res.headers.get("content-type") || "").toLowerCase();
    if (ct && !ct.includes("text/html")) return null;
    const html = (await res.text()).slice(0, 250_000);
    const result = looksLikePersonalPortfolioFromHtml(html);
    return result.reject ? result.reason : null;
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

