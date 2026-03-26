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

  const report: ReviewReport = {
    url: canonicalUrl,
    title,
    letter,
  };
  return report;
}
