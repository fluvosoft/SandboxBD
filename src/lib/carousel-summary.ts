import type { ReviewReport } from "@/lib/api";
import { sanitizeLetterPlainText } from "@/lib/letter-format";

function truncateWords(text: string, maxLen: number): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= maxLen) return t;
  const cut = t.slice(0, maxLen - 1);
  const lastSpace = cut.lastIndexOf(" ");
  const base =
    lastSpace > Math.min(60, maxLen * 0.4) ? cut.slice(0, lastSpace) : cut;
  return base + "…";
}

/** Blurb from stored report; length tuned per surface (carousel vs gallery). */
export function summaryFromReport(report: ReviewReport, maxLen: number): string {
  if (report.letter?.trim()) {
    const t = sanitizeLetterPlainText(report.letter).replace(/\s+/g, " ").trim();
    return truncateWords(t, maxLen);
  }
  if (report.summary?.trim()) {
    return truncateWords(report.summary, maxLen);
  }
  if (report.the_roast?.trim()) {
    return truncateWords(report.the_roast, maxLen);
  }
  if (report.startup_claim?.trim()) {
    return truncateWords(report.startup_claim, maxLen);
  }
  return "Honest AI feedback is on file. Open the card to read the full review.";
}

export function summaryForCarouselCard(report: ReviewReport): string {
  return summaryFromReport(report, 140);
}

export function summaryForGalleryCard(report: ReviewReport): string {
  return summaryFromReport(report, 380);
}
