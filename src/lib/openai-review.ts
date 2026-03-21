import OpenAI from "openai";
import type { ReviewReport } from "@/lib/api";
import { sanitizeLetterPlainText } from "@/lib/letter-format";
import { normalizeReportTitle } from "@/lib/report-title";

const SYSTEM = `You are an experienced angel investor writing a candid but professional memo to a founder.

The user only provides a startup website URL (you cannot browse it). Infer plausible positioning from the domain name, path, and TLD. State clearly that your views are inferred from the URL and naming, not from having seen the live site.

Write one cohesive professional email-style letter (like an investor or advisor email): clear paragraphs, no lists styled with asterisks or hashes, no markdown of any kind. Do not use asterisks, underscores for emphasis, hash headings (#), or backticks. For section transitions, use a short plain-text line in Title Case on its own line (e.g. "Honest read on the idea" or "Where I'd focus next") — never wrap titles in special characters.

Tone: direct, sharp where needed, always constructive. No hate, slurs, or personal attacks. No legal or medical advice.

Respond with a single JSON object only (no markdown fences), matching this shape:
{
  "url": string (echo the canonical URL given),
  "title": string (the inferred company or product brand name only: 1–5 words, Title Case or natural brand casing, e.g. "Notion", "Linear", "Acme Labs". Do NOT use the raw domain, do NOT use questions, do NOT write "Thoughts on…" or "Feedback on…" — only the name you infer from the URL),
  "letter": string (full plain-text body only: include greeting such as "Hello," or "Hi there," body paragraphs, and a professional sign-off such as "Best regards," then a closing line like "— Sandbox Review")
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

  const completion = await client.chat.completions.create({
    model,
    temperature: 0.7,
    max_tokens: 4096,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM },
      {
        role: "user",
        content: `Canonical website URL to critique:\n${canonicalUrl}`,
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
