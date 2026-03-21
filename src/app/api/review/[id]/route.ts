import { NextResponse } from "next/server";
import type { ReviewReport } from "@/lib/api";
import { getReviewsFirestore, REVIEWS_COLLECTION } from "@/lib/firebase-admin";
import { clientIpFromRequest, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

type StoredDoc = {
  url: string;
  report: ReviewReport;
  lastAnalyzedDay: string;
};

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const ip = clientIpFromRequest(request);
  const lim = rateLimit(`review:get:${ip}`, 60, 10 * 60 * 1000);
  if (!lim.ok) {
    return NextResponse.json(
      { error: "Too many requests" },
      {
        status: 429,
        headers: { "Retry-After": String(lim.retryAfterSec) },
      }
    );
  }

  const { id } = await context.params;
  if (!id || id.length > 64 || !/^[a-f0-9]+$/i.test(id)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

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
  return NextResponse.json({ report: data.report });
}
