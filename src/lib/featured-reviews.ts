import { unstable_cache } from "next/cache";
import type { FeaturedCarouselItem, ReviewReport } from "@/lib/api";
import { summaryForCarouselCard, summaryForGalleryCard } from "@/lib/carousel-summary";
import { getReviewsFirestore, REVIEWS_COLLECTION } from "@/lib/firebase-admin";
import { normalizeReportTitle } from "@/lib/report-title";

const LIMIT = 32;

/** How long the server data cache is valid if not invalidated (seconds). */
const FEATURED_REVALIDATE_SECONDS = 120;

export const FEATURED_REVIEWS_CACHE_TAG = "featured-reviews";

type StoredDoc = {
  url: string;
  report: ReviewReport;
};

function stableVisits(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = Math.imul(31, h) + id.charCodeAt(i);
  }
  return 5200 + (Math.abs(h) % 11500);
}

async function loadFeaturedReviewItemsFromFirestore(): Promise<FeaturedCarouselItem[]> {
  const db = getReviewsFirestore();
  const snap = await db
    .collection(REVIEWS_COLLECTION)
    .orderBy("updatedAt", "desc")
    .limit(LIMIT)
    .get();

  const items: FeaturedCarouselItem[] = [];
  snap.forEach((doc) => {
    const data = doc.data() as StoredDoc;
    if (!data?.url || !data?.report) return;
    const report = data.report;
    const name = normalizeReportTitle(
      typeof report.title === "string" ? report.title : undefined,
      data.url
    );
    items.push({
      id: doc.id,
      url: data.url,
      name,
      summary: summaryForCarouselCard(report),
      summaryLong: summaryForGalleryCard(report),
      visits: stableVisits(doc.id),
      valuation: "Sandbox",
    });
  });
  return items;
}

const getCachedFeaturedReviewItems = unstable_cache(
  async () => loadFeaturedReviewItemsFromFirestore(),
  ["featured-review-items-v1"],
  {
    revalidate: FEATURED_REVALIDATE_SECONDS,
    tags: [FEATURED_REVIEWS_CACHE_TAG],
  }
);

/**
 * Firestore-backed featured list (server / API). Cached to limit Firestore reads;
 * call `revalidateTag(FEATURED_REVIEWS_CACHE_TAG)` after a new/updated review.
 */
export async function getFeaturedReviewItems(): Promise<FeaturedCarouselItem[]> {
  try {
    return await getCachedFeaturedReviewItems();
  } catch (e) {
    console.error("[getFeaturedReviewItems]", e);
    return [];
  }
}
