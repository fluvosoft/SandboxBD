import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { FieldValue } from "firebase-admin/firestore";
import type { ReviewReport } from "@/lib/api";
import { FEATURED_REVIEWS_CACHE_TAG } from "@/lib/featured-reviews";
import { getReviewsFirestore, REVIEWS_COLLECTION } from "@/lib/firebase-admin";
import { generateStartupRoastReport } from "@/lib/openai-review";
import { clientIpFromRequest, rateLimit } from "@/lib/rate-limit";
import {
  assertPublicWebsiteUrl,
  normalizeWebsiteUrl,
  siteKeyFromCanonicalUrl,
  utcCalendarDay,
} from "@/lib/site-url";

export const runtime = "nodejs";
export const maxDuration = 120;

function assertAllowedOrigin(request: Request): NextResponse | null {
  const allowed = process.env.APP_ORIGIN?.replace(/\/$/, "");
  if (!allowed) return null;
  const origin = request.headers.get("origin");
  if (!origin) return null;
  if (origin !== allowed) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }
  return null;
}

type StoredDoc = {
  url: string;
  report: ReviewReport;
  lastAnalyzedDay: string;
};

export async function POST(request: Request) {
  const originBlock = assertAllowedOrigin(request);
  if (originBlock) return originBlock;

  const ip = clientIpFromRequest(request);
  const ipLimit = rateLimit(`review:ip:${ip}`, 12, 10 * 60 * 1000);
  if (!ipLimit.ok) {
    return NextResponse.json(
      { ok: false, error: "Too many requests. Try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(ipLimit.retryAfterSec) },
      }
    );
  }

  let body: { url?: string; _trap?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  if (body._trap) {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }

  const rawUrl = typeof body.url === "string" ? body.url : "";
  if (!rawUrl.trim()) {
    return NextResponse.json({ ok: false, error: "URL is required" }, { status: 400 });
  }

  let canonical: string;
  try {
    canonical = normalizeWebsiteUrl(rawUrl);
    assertPublicWebsiteUrl(canonical);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Invalid URL";
    return NextResponse.json({ ok: false, error: msg }, { status: 400 });
  }

  const reportId = siteKeyFromCanonicalUrl(canonical);
  const today = utcCalendarDay();

  let db;
  try {
    db = getReviewsFirestore();
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server configuration error";
    console.error("[api/review] Firestore init:", msg);
    const error =
      process.env.NODE_ENV === "development"
        ? `${msg} — For production, set FIREBASE_SERVICE_ACCOUNT_JSON or FIREBASE_* in your host (e.g. Vercel → Settings → Environment Variables) and redeploy.`
        : `${msg} If you are the site owner: add Firebase Admin credentials to the deployment environment and redeploy.`;
    return NextResponse.json({ ok: false, error }, { status: 503 });
  }

  const ref = db.collection(REVIEWS_COLLECTION).doc(reportId);
  const snap = await ref.get();

  if (snap.exists) {
    const data = snap.data() as StoredDoc;
    const lastDay = data.lastAnalyzedDay;
    if (lastDay === today) {
      return NextResponse.json({
        ok: true,
        report_id: reportId,
        report: data.report,
        reusedToday: true,
        message:
          "This website was already analyzed today. Here is your report — one fresh analysis per URL per day.",
      });
    }
  }

  let report: ReviewReport;
  try {
    report = await generateStartupRoastReport(canonical);
  } catch {
    return NextResponse.json(
      { ok: false, error: "Could not generate a report right now. Try again later." },
      { status: 502 }
    );
  }

  await ref.set(
    {
      url: canonical,
      report,
      lastAnalyzedDay: today,
      updatedAt: FieldValue.serverTimestamp(),
      ...(snap.exists ? {} : { createdAt: FieldValue.serverTimestamp() }),
    },
    { merge: true }
  );

  revalidateTag(FEATURED_REVIEWS_CACHE_TAG, "max");

  return NextResponse.json({
    ok: true,
    report_id: reportId,
    report,
    reusedToday: false,
  });
}
