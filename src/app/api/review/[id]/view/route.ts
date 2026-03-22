import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getReviewsFirestore, REVIEWS_COLLECTION } from "@/lib/firebase-admin";
import { FEATURED_REVIEWS_CACHE_TAG } from "@/lib/featured-reviews";
import { clientIpFromRequest, rateLimit } from "@/lib/rate-limit";
import { shouldSkipViewIncrement } from "@/lib/view-request-guard";
import { revalidateTag } from "next/cache";

export const runtime = "nodejs";

const ID_RE = /^[a-f0-9]{16,64}$/i;

const WINDOW_MS = 10 * 60 * 1000;
/** All view POSTs from this IP (any review). */
const GLOBAL_VIEW_LIMIT = 150;
/** View POSTs for one review id from this IP (refresh / revisit spam). */
const PER_DOC_VIEW_LIMIT = 80;

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const ip = clientIpFromRequest(request);
  const globalLim = rateLimit(`review:view:ip:${ip}`, GLOBAL_VIEW_LIMIT, WINDOW_MS);
  if (!globalLim.ok) {
    return NextResponse.json(
      { error: "Too many requests" },
      {
        status: 429,
        headers: { "Retry-After": String(globalLim.retryAfterSec) },
      }
    );
  }

  const { id } = await context.params;
  if (!id || !ID_RE.test(id)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let db;
  try {
    db = getReviewsFirestore();
  } catch {
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  }

  const ref = db.collection(REVIEWS_COLLECTION).doc(id);
  const snap = await ref.get();
  if (!snap.exists) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const currentCount = (): number => {
    const v = snap.data()?.viewCount;
    return typeof v === "number" && Number.isFinite(v) ? Math.max(0, Math.floor(v)) : 0;
  };

  if (shouldSkipViewIncrement(request)) {
    return NextResponse.json({ viewCount: currentCount(), counted: false });
  }

  const docLim = rateLimit(
    `review:view:ip:${ip}:doc:${id}`,
    PER_DOC_VIEW_LIMIT,
    WINDOW_MS
  );
  if (!docLim.ok) {
    return NextResponse.json(
      { error: "Too many requests", viewCount: currentCount(), counted: false },
      {
        status: 429,
        headers: { "Retry-After": String(docLim.retryAfterSec) },
      }
    );
  }

  await ref.update({
    viewCount: FieldValue.increment(1),
  });

  const next = await ref.get();
  const viewCount =
    typeof next.data()?.viewCount === "number" ? next.data()!.viewCount : 1;

  revalidateTag(FEATURED_REVIEWS_CACHE_TAG, "max");

  return NextResponse.json({ viewCount, counted: true });
}
