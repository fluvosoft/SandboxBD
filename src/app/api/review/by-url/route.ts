import { NextResponse } from "next/server";
import type { ReviewReport } from "@/lib/api";
import { getReviewsFirestore, REVIEWS_COLLECTION } from "@/lib/firebase-admin";
import { reportWithNormalizedTitle } from "@/lib/report-title";
import { clientIpFromRequest, rateLimit } from "@/lib/rate-limit";
import {
  assertPublicWebsiteUrl,
  normalizeWebsiteUrl,
  siteKeyFromCanonicalUrl,
} from "@/lib/site-url";

export const runtime = "nodejs";

type StoredDoc = {
  url: string;
  report: ReviewReport;
  lastAnalyzedDay: string;
  viewCount?: number;
};

export async function GET(request: Request) {
  const ip = clientIpFromRequest(request);
  const lim = rateLimit(`review:byurl:${ip}`, 60, 10 * 60 * 1000);
  if (!lim.ok) {
    return NextResponse.json(
      { error: "Too many requests" },
      {
        status: 429,
        headers: { "Retry-After": String(lim.retryAfterSec) },
      }
    );
  }

  const { searchParams } = new URL(request.url);
  const raw = searchParams.get("url") || "";
  if (!raw.trim()) {
    return NextResponse.json({ error: "Missing url" }, { status: 400 });
  }

  let canonical: string;
  try {
    canonical = normalizeWebsiteUrl(raw);
    assertPublicWebsiteUrl(canonical);
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  const id = siteKeyFromCanonicalUrl(canonical);

  let db;
  try {
    db = getReviewsFirestore();
  } catch {
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  }

  const snap = await db.collection(REVIEWS_COLLECTION).doc(id).get();
  if (!snap.exists) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const data = snap.data() as StoredDoc;
  const viewCount =
    typeof data.viewCount === "number" && Number.isFinite(data.viewCount)
      ? Math.max(0, Math.floor(data.viewCount))
      : 0;
  return NextResponse.json({
    report: reportWithNormalizedTitle(data.report, data.url),
    viewCount,
    report_id: id,
  });
}
