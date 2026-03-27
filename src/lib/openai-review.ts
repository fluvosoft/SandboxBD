import OpenAI from "openai";
import type { ReviewReport } from "@/lib/api";
import { sanitizeLetterPlainText } from "@/lib/letter-format";
import { normalizeReportTitle } from "@/lib/report-title";

const FETCH_TIMEOUT_MS = 9_000;
const MAX_SNIPPET_CHARS = 4_000;

const CHROME_LIKE_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

function classifyReviewTarget(canonicalUrl: string): "website" | "google_play" | "apple_app_store" {
  try {
    const h = new URL(canonicalUrl).hostname.toLowerCase();
    if (h === "play.google.com") return "google_play";
    if (h === "apps.apple.com" || h === "itunes.apple.com") return "apple_app_store";
  } catch {
    /* ignore */
  }
  return "website";
}

function decodeHtmlEntities(input: string): string {
  return input
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");
}

function cleanText(input: string): string {
  return decodeHtmlEntities(input).replace(/\s+/g, " ").trim();
}

function pickFirstMatch(source: string, re: RegExp): string {
  const m = source.match(re);
  return cleanText(m?.[1] || "");
}

function stripHtmlForSnippet(html: string): string {
  return cleanText(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
      .replace(/<!--[\s\S]*?-->/g, " ")
      .replace(/<[^>]+>/g, " ")
  );
}

type PageSignals = {
  kind: "website" | "google_play" | "apple_app_store";
  finalUrl: string;
  title: string;
  metaDescription: string;
  ogTitle: string;
  ogDescription: string;
  h1: string[];
  snippet: string;
};

async function fetchPageSignals(canonicalUrl: string): Promise<PageSignals | null> {
  const kind = classifyReviewTarget(canonicalUrl);
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(canonicalUrl, {
      method: "GET",
      redirect: "follow",
      signal: ac.signal,
      headers: {
        "User-Agent": CHROME_LIKE_UA,
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });
    if (!res.ok) return null;
    const ct = (res.headers.get("content-type") || "").toLowerCase();
    if (ct && !ct.includes("text/html") && !ct.includes("application/xhtml")) {
      return null;
    }
    const html = await res.text();
    if (!html.trim().startsWith("<")) return null;
    const title = pickFirstMatch(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
    const metaDescription = pickFirstMatch(
      html,
      /<meta[^>]+name=["']description["'][^>]+content=["']([\s\S]*?)["'][^>]*>/i
    );
    const ogTitle = pickFirstMatch(
      html,
      /<meta[^>]+property=["']og:title["'][^>]+content=["']([\s\S]*?)["'][^>]*>/i
    );
    const ogDescription = pickFirstMatch(
      html,
      /<meta[^>]+property=["']og:description["'][^>]+content=["']([\s\S]*?)["'][^>]*>/i
    );
    const h1 = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)]
      .slice(0, 5)
      .map((m) => cleanText(m[1] || ""))
      .filter(Boolean);
    const snippet = stripHtmlForSnippet(html).slice(0, MAX_SNIPPET_CHARS);

    return {
      kind,
      finalUrl: res.url || canonicalUrl,
      title,
      metaDescription,
      ogTitle,
      ogDescription,
      h1,
      snippet,
    };
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

type ReviewEligibility =
  | { allowed: true }
  | { allowed: false; message: string; category?: string };

type SandBand = "High Risk" | "Needs Work" | "Promising" | "Strong";
type SandPillars = {
  positioning_icp: number;
  wedge_moat: number;
  gtm_distribution: number;
  pricing_business_model: number;
  trust_ux: number;
};
type SandRationales = {
  positioning_icp: string;
  wedge_moat: string;
  gtm_distribution: string;
  pricing_business_model: string;
  trust_ux: string;
};
type SandScorecard = {
  sand_score: number;
  band: SandBand;
  pillars: SandPillars;
  summary: string;
  rationales: SandRationales;
};

const ELIGIBILITY_SYSTEM = `You are a strict gatekeeper for SANDBOX startup reviews.

Task:
Given a canonical URL and optional page evidence, decide whether the URL is eligible for startup review.

Allow only:
- startup/company official websites
- official Google Play app listing URLs
- official Apple App Store listing URLs

Reject:
- personal portfolio/CV/resume/profile sites
- social media profiles/channels/pages
- university/college/school/club/community organization pages
- documentation-only pages, generic blogs, and media channels that are not startup/company primary sites
- government/nonprofit/institutional pages not representing a startup/company product

Output JSON ONLY:
{
  "allowed": boolean,
  "category": "startup_company" | "app_store_listing" | "personal_portfolio" | "social_profile" | "education_or_club" | "institutional_non_startup" | "other_non_startup",
  "message": string
}

Rules:
- If uncertain, reject conservatively when strong non-startup signals are present.
- Keep message short, user-facing, and polite.
- Never include markdown.`;

const SCORECARD_SYSTEM = `You are an experienced early-stage startup evaluator creating a simple, transparent scorecard for founders.

Your task:
Given a startup's public information (URL, basic page evidence, and optionally a review letter), assign:
1) 5 pillar scores from 0-10
2) One overall "Sand Score" from 0-100
3) A short rationale

Scoring model:
- You MUST use these exact 5 pillars, each scored as an integer 0-10:
  - positioning_icp
  - wedge_moat
  - gtm_distribution
  - pricing_business_model
  - trust_ux

- Compute the overall Sand Score (0-100) as a weighted sum of the 5 pillars:
  - positioning_icp:        15%
  - wedge_moat:             25%
  - gtm_distribution:       25%
  - pricing_business_model: 15%
  - trust_ux:               20%

- Formula (you must follow this exactly):
  - base = 0.15 * positioning_icp
        + 0.25 * wedge_moat
        + 0.25 * gtm_distribution
        + 0.15 * pricing_business_model
        + 0.20 * trust_ux
  - sand_score = round(10 * base)

- Also assign a band label based on sand_score:
  - 0-39 => "High Risk"
  - 40-59 => "Needs Work"
  - 60-79 => "Promising"
  - 80-100 => "Strong"

Evidence and uncertainty:
- You ONLY see public information (URL + HTML snippet, meta tags, store listing text, and optionally a review letter).
- NEVER invent hidden data such as revenue, users, MAU, churn, or funding.
- If an area has weak evidence (for example, no pricing page), keep that pillar <= 5/10 and explicitly mention that information is missing.
- When you infer something that is not explicit in the evidence, prefix it with "We infer that..." in the rationale.

Output format:
You MUST respond with a single JSON object only (no markdown, no extra text), matching exactly this shape:
{
  "sand_score": number,
  "band": "High Risk" | "Needs Work" | "Promising" | "Strong",
  "pillars": {
    "positioning_icp": number,
    "wedge_moat": number,
    "gtm_distribution": number,
    "pricing_business_model": number,
    "trust_ux": number
  },
  "summary": string,
  "rationales": {
    "positioning_icp": string,
    "wedge_moat": string,
    "gtm_distribution": string,
    "pricing_business_model": string,
    "trust_ux": string
  }
}

Style:
- Be concise but specific.
- Do not give advice here; just scoring + rationales.
- No markdown, no bullet characters, no headings.

If inputs are extremely weak or clearly not a startup/company/app, set all pillars to 0, sand_score = 0, band = "High Risk", and briefly explain in the summary.`;

function clampInt(n: unknown, min: number, max: number): number {
  const x = typeof n === "number" && Number.isFinite(n) ? Math.round(n) : min;
  return Math.max(min, Math.min(max, x));
}

function normalizeBand(score: number): SandBand {
  if (score <= 39) return "High Risk";
  if (score <= 59) return "Needs Work";
  if (score <= 79) return "Promising";
  return "Strong";
}

function parseSandScorecard(raw: string): SandScorecard | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== "object") return null;
  const o = parsed as Record<string, unknown>;
  const p0 = (o.pillars as Record<string, unknown>) || {};
  const r0 = (o.rationales as Record<string, unknown>) || {};
  const pillars: SandPillars = {
    positioning_icp: clampInt(p0.positioning_icp, 0, 10),
    wedge_moat: clampInt(p0.wedge_moat, 0, 10),
    gtm_distribution: clampInt(p0.gtm_distribution, 0, 10),
    pricing_business_model: clampInt(p0.pricing_business_model, 0, 10),
    trust_ux: clampInt(p0.trust_ux, 0, 10),
  };
  const base =
    0.15 * pillars.positioning_icp +
    0.25 * pillars.wedge_moat +
    0.25 * pillars.gtm_distribution +
    0.15 * pillars.pricing_business_model +
    0.2 * pillars.trust_ux;
  const sand_score = clampInt(Math.round(10 * base), 0, 100);
  const band = normalizeBand(sand_score);
  const summary =
    typeof o.summary === "string" && o.summary.trim()
      ? o.summary.trim()
      : "Evidence-based startup scorecard generated from public information only.";
  const txt = (v: unknown): string =>
    typeof v === "string" && v.trim()
      ? v.trim()
      : "We infer that available public evidence is limited for this pillar.";
  const rationales: SandRationales = {
    positioning_icp: txt(r0.positioning_icp),
    wedge_moat: txt(r0.wedge_moat),
    gtm_distribution: txt(r0.gtm_distribution),
    pricing_business_model: txt(r0.pricing_business_model),
    trust_ux: txt(r0.trust_ux),
  };
  return { sand_score, band, pillars, summary, rationales };
}

async function generateSandScorecard(
  client: OpenAI,
  model: string,
  canonicalUrl: string,
  pageSignals: PageSignals | null,
  reviewLetter?: string
): Promise<SandScorecard | null> {
  const evidence = pageSignals
    ? JSON.stringify(pageSignals)
    : "No page evidence could be fetched.";
  const letterBlock = reviewLetter?.trim()
    ? reviewLetter.trim().slice(0, 3500)
    : "No review letter available.";
  try {
    const completion = await client.chat.completions.create({
      model,
      temperature: 0,
      max_tokens: 1200,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SCORECARD_SYSTEM },
        {
          role: "user",
          content:
            `Canonical URL:\n${canonicalUrl}\n\n` +
            `Page evidence (JSON):\n${evidence}\n\n` +
            `Optional review letter:\n${letterBlock}`,
        },
      ],
    });
    const raw = completion.choices[0]?.message?.content?.trim();
    if (!raw) return null;
    return parseSandScorecard(raw);
  } catch {
    return null;
  }
}

function defaultEligibilityRejectMessage(): string {
  return "This link looks outside SANDBOX scope. Please submit a startup/company official website or an official Google Play/App Store listing.";
}

export async function assessReviewEligibility(
  canonicalUrl: string
): Promise<ReviewEligibility> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return { allowed: true };

  const pageSignals = await fetchPageSignals(canonicalUrl);
  const evidenceBlock = pageSignals
    ? JSON.stringify(pageSignals)
    : "No page evidence could be fetched.";

  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const client = new OpenAI({ apiKey: key });

  try {
    const completion = await client.chat.completions.create({
      model,
      temperature: 0,
      max_tokens: 300,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: ELIGIBILITY_SYSTEM },
        {
          role: "user",
          content: `Canonical URL:\n${canonicalUrl}\n\nPage evidence (JSON):\n${evidenceBlock}`,
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content?.trim();
    if (!raw) return { allowed: true };

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return { allowed: true };
    }

    if (!parsed || typeof parsed !== "object") return { allowed: true };
    const o = parsed as Record<string, unknown>;
    const allowed = o.allowed === true;
    if (allowed) return { allowed: true };

    const message =
      typeof o.message === "string" && o.message.trim()
        ? o.message.trim()
        : defaultEligibilityRejectMessage();
    const category =
      typeof o.category === "string" && o.category.trim()
        ? o.category.trim()
        : undefined;
    return { allowed: false, message, category };
  } catch {
    return { allowed: true };
  }
}

const SYSTEM = `You are part of an experienced investment-style review team writing a candid but professional memo to a founder.

Voice (required): Write the entire letter in first-person plural only, as the SANDBOX review team. Use "we", "us", and "our" for all reviewer statements (e.g. "we reviewed", "we think", "our read is"). Do not use "I", "me", or "my" for the reviewer. Hypotheticals or quoted third parties may use other wording when natural.

You will receive:
1) A canonical URL (startup website, or Google Play / Apple App Store listing).
2) Optional page evidence (title/meta/H1/snippet) fetched server-side from that URL.

When the target is a mobile app store listing, review it as a product and business (positioning, category, ratings narrative in text if visible, monetization hints, competitive context from description). You still cannot install the app; be explicit about limits of URL-only review.

Use available evidence when present. If evidence is missing or weak, say exactly what is inferred vs what is uncertain.

Write one cohesive professional email-style letter (like an investor or advisor email): clear paragraphs, no lists styled with asterisks or hashes, no markdown of any kind. Do not use asterisks, underscores for emphasis, hash headings (#), or backticks. For section transitions, use short plain-text lines in Title Case on their own line. Keep the "we" voice throughout the body after the greeting.

The review must be materially insightful and specific, not generic. Cover these founder-critical lenses:
- Positioning clarity and ICP precision
- Product wedge and differentiation durability
- Go-to-market channel fit and distribution risk
- Business model and pricing viability
- Operational/technical trust signals from the website or store listing (messaging, polish, credibility)
- Top 3 likely failure modes over 24-36 months
- Prioritized fixes: what to do in 30 days, then 90 days

Tone: direct, sharp where needed, always constructive. No hate, slurs, or personal attacks. No legal or medical advice.

Avoid dramatic insults. This is a tough but professional investor memo.

Respond with a single JSON object only (no markdown fences), matching this shape:
{
  "url": string (echo the canonical URL given),
  "title": string (the inferred company or product brand name only: 1-5 words, Title Case or natural brand casing, e.g. "Notion", "Linear", "Acme Labs". Do NOT use the raw domain, do NOT use questions, do NOT write "Thoughts on…" or "Feedback on…". Only the name you infer from the URL),
  "letter": string (full plain-text body only: include greeting such as "Hello," or "Hi there," then body paragraphs in "we" voice, and a professional sign-off such as "Best regards," then a closing line like "- Sandbox Review")
}`;

export async function generateStartupRoastReport(
  canonicalUrl: string
): Promise<ReviewReport> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    throw new Error("OPENAI_API_KEY is not set");
  }
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const client = new OpenAI({ apiKey: key });
  const pageSignals = await fetchPageSignals(canonicalUrl);
  const evidenceBlock = pageSignals
    ? JSON.stringify(pageSignals)
    : "No page evidence could be fetched (timeout, blocked, non-HTML, or fetch failed).";

  const completion = await client.chat.completions.create({
    model,
    temperature: 0.45,
    max_tokens: 4096,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM },
      {
        role: "user",
        content: `Canonical URL to critique:\n${canonicalUrl}\n\nPage evidence (JSON):\n${evidenceBlock}`,
      },
    ],
  });

  const raw = completion.choices[0]?.message?.content?.trim();
  if (!raw) {
    throw new Error("Empty model response");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Model returned invalid JSON");
  }

  if (!parsed || typeof parsed !== "object") {
    throw new Error("Invalid report shape");
  }
  const o = parsed as Record<string, unknown>;
  const rawLetter = typeof o.letter === "string" ? o.letter.trim() : "";
  if (!rawLetter) {
    throw new Error("Report missing letter");
  }
  const letter = sanitizeLetterPlainText(rawLetter);

  const rawTitle = typeof o.title === "string" ? o.title.trim() : "";
  const title = normalizeReportTitle(rawTitle || undefined, canonicalUrl);
  const scorecard = await generateSandScorecard(
    client,
    model,
    canonicalUrl,
    pageSignals,
    letter
  );

  const report: ReviewReport = {
    url: canonicalUrl,
    title,
    letter,
    ...(scorecard
      ? {
          sand_score: scorecard.sand_score,
          sand_band: scorecard.band,
          sand_pillars: scorecard.pillars,
          sand_summary: scorecard.summary,
          sand_rationales: scorecard.rationales,
        }
      : {}),
  };
  return report;
}
