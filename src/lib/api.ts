/**
 * Backend API client for the startup review service.
 * Base URL is set via NEXT_PUBLIC_API_URL (e.g. http://localhost:8080).
 */

export interface ReviewReport {
  url: string;
  title?: string;
  /** Open letter: single long-form investor letter (new format) */
  letter?: string;
  // VC roast structure (sectioned format)
  startup_claim?: string;
  what_it_actually_looks_like?: string;
  the_roast?: string;
  red_flags?: string[];
  product_reality_check?: string;
  business_model_reality_check?: string;
  investor_rejection_reasons?: string[];
  what_would_actually_fix_this?: string[];
  // Legacy
  summary?: string;
  strengths?: string[];
  weaknesses?: string[];
  market_risks?: string[];
  investor_concerns?: string[];
  improvement_suggestions?: string[];
  founder_suggestions?: string[];
  product_overview?: string;
  features?: string[];
  pricing_overview?: string;
  messaging_overview?: string;
}

export function isOpenLetter(report: ReviewReport): boolean {
  return !!(report.letter && report.letter.trim().length > 0);
}

export function isVCRoast(report: ReviewReport): boolean {
  return !!(report.the_roast || report.startup_claim || (report.red_flags && report.red_flags.length > 0));
}

export interface ReviewResponse {
  ok: boolean;
  report?: ReviewReport;
  report_id?: string;
  report_url?: string;
  reusedToday?: boolean;
  message?: string;
  error?: string;
}

/** Legacy external API base, or empty to use this app's `/api/review` routes. */
const getExternalApiBase = (): string => {
  return (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
};

function reviewPostUrl(): string {
  const ext = getExternalApiBase();
  return ext ? `${ext}/review` : "/api/review";
}

function reviewGetByIdUrl(id: string): string {
  const ext = getExternalApiBase();
  return ext ? `${ext}/review/${encodeURIComponent(id)}` : `/api/review/${encodeURIComponent(id)}`;
}

function reviewViewPostUrl(id: string): string {
  const ext = getExternalApiBase();
  const enc = encodeURIComponent(id);
  return ext ? `${ext}/review/${enc}/view` : `/api/review/${enc}/view`;
}

function reviewGetByUrlQuery(url: string): string {
  const ext = getExternalApiBase();
  const q = `url=${encodeURIComponent(url)}`;
  return ext ? `${ext}/review/by-url?${q}` : `/api/review/by-url?${q}`;
}

function reviewFeaturedUrl(): string {
  const ext = getExternalApiBase();
  return ext ? `${ext}/review/featured` : "/api/review/featured";
}

/** Public carousel payload from Firestore-backed reviews. */
export interface FeaturedCarouselItem {
  id: string;
  url: string;
  name: string;
  summary: string;
  /** Longer excerpt for gallery / detail cards */
  summaryLong: string;
  visits: number;
  valuation: string;
}

/** In-memory cache so repeat visits / remounts don’t hammer `/api/review/featured`. */
let featuredClientCache: {
  baseKey: string;
  items: FeaturedCarouselItem[];
  at: number;
} | null = null;

const FEATURED_CLIENT_TTL_MS = 45_000;

/** Call after a successful review so the carousel refetches (server cache is also revalidated). */
export function clearFeaturedCarouselClientCache(): void {
  featuredClientCache = null;
}

export async function getFeaturedCarouselItems(): Promise<FeaturedCarouselItem[]> {
  const baseKey = getExternalApiBase() || "__same_origin__";
  const now = Date.now();
  if (
    featuredClientCache &&
    featuredClientCache.baseKey === baseKey &&
    now - featuredClientCache.at < FEATURED_CLIENT_TTL_MS
  ) {
    return featuredClientCache.items;
  }

  try {
    const res = await fetch(reviewFeaturedUrl(), {
      method: "GET",
      credentials: "same-origin",
    });
    if (!res.ok) return [];
    const data = (await res.json()) as { items?: FeaturedCarouselItem[] };
    const items = Array.isArray(data?.items) ? data.items : [];
    featuredClientCache = { baseKey, items, at: Date.now() };
    return items;
  } catch {
    return [];
  }
}

export async function submitReview(
  url: string,
  trapField = ""
): Promise<ReviewResponse> {
  const res = await fetch(reviewPostUrl(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, _trap: trapField }),
  });
  const data = await res.json();
  if (!res.ok) {
    return { ok: false, error: data?.error || `Request failed (${res.status})` };
  }
  return data as ReviewResponse;
}

export type ReportFetchResult = {
  report: ReviewReport;
  viewCount: number;
  /** Present when loaded via by-url; use for view counting. */
  reportId?: string;
};

function parseViewCount(data: { viewCount?: unknown }): number {
  const v = data.viewCount;
  if (typeof v === "number" && Number.isFinite(v)) return Math.max(0, Math.floor(v));
  return 0;
}

/** Fetches a stored report by ID (e.g. when user opens the link from email). */
export async function getReportById(
  id: string
): Promise<ReportFetchResult | null> {
  const res = await fetch(reviewGetByIdUrl(id));
  if (!res.ok) return null;
  const data = (await res.json()) as { report?: ReviewReport };
  if (!data?.report) return null;
  return {
    report: data.report,
    viewCount: parseViewCount(data as { viewCount?: unknown }),
  };
}

/** Fetches the latest stored report by website URL (for search / paste link). */
export async function getReportByURL(
  url: string
): Promise<ReportFetchResult | null> {
  const res = await fetch(reviewGetByUrlQuery(url));
  if (!res.ok) return null;
  const data = (await res.json()) as {
    report?: ReviewReport;
    report_id?: string;
  };
  if (!data?.report) return null;
  return {
    report: data.report,
    viewCount: parseViewCount(data as { viewCount?: unknown }),
    reportId: typeof data.report_id === "string" ? data.report_id : undefined,
  };
}

/** Records one page view (server increments Firestore). Returns new total or null. */
export async function recordReviewView(id: string): Promise<number | null> {
  try {
    const res = await fetch(reviewViewPostUrl(id), {
      method: "POST",
      credentials: "same-origin",
    });
    const data = (await res.json().catch(() => null)) as {
      viewCount?: unknown;
    } | null;
    const v = data?.viewCount;
    const n =
      typeof v === "number" && Number.isFinite(v)
        ? Math.max(0, Math.floor(v))
        : null;
    if (res.ok && n != null) return n;
    if (res.status === 429 && n != null) return n;
    return null;
  } catch {
    return null;
  }
}

export const FEEDBACK_STORAGE_PREFIX = "sandbox_feedback_";

export function saveReportToSession(id: string, report: ReviewReport): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(FEEDBACK_STORAGE_PREFIX + id, JSON.stringify(report));
}

export function getReportFromSession(id: string): ReviewReport | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(FEEDBACK_STORAGE_PREFIX + id);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ReviewReport;
  } catch {
    return null;
  }
}
