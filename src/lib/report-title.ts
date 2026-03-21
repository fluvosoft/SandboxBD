import type { ReviewReport } from "@/lib/api";

/**
 * Derive a display-friendly brand from the URL host (e.g. datasythis.com → Datasythis).
 */
export function brandNameFromUrl(canonicalUrl: string): string {
  try {
    const host = new URL(canonicalUrl).hostname.replace(/^www\./i, "");
    const first = host.split(".")[0] || host;
    if (!first) return "Startup";
    const spaced = first.replace(/[-_]+/g, " ").trim();
    return spaced
      .split(/\s+/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");
  } catch {
    return "Startup";
  }
}

/**
 * Prefer a real company-style title; drop "Thoughts on domain.com?" style subjects.
 */
export function normalizeReportTitle(
  rawTitle: string | undefined,
  canonicalUrl: string
): string {
  const fallback = brandNameFromUrl(canonicalUrl);
  const t = rawTitle?.trim();
  if (!t) return fallback;

  const lower = t.toLowerCase();

  if (/\?/.test(t) && /\.(com|io|ai|app|dev|co|net|org)\b/i.test(t)) {
    return fallback;
  }

  if (
    /^(thoughts?|quick thoughts?|notes?|memo|feedback|re)\s*[:\s]+on\s+/i.test(
      lower
    ) ||
    /\b(thoughts on|quick thoughts on)\b/i.test(lower)
  ) {
    return fallback;
  }

  if (/^https?:\/\//i.test(t) || /^www\./i.test(t)) {
    return fallback;
  }

  if (
    /^[a-z0-9][a-z0-9.-]*\.(com|io|ai|app|dev|co|net|org)\s*$/i.test(t)
  ) {
    return fallback;
  }

  return t;
}

export function reportWithNormalizedTitle(
  report: ReviewReport,
  canonicalUrl: string
): ReviewReport {
  return {
    ...report,
    title: normalizeReportTitle(report.title, canonicalUrl),
  };
}
