import { NextResponse } from "next/server";
import type { FeaturedCarouselItem } from "@/lib/api";
import { getFeaturedReviewItems } from "@/lib/featured-reviews";
import { clientIpFromRequest, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const ip = clientIpFromRequest(request);
  const lim = rateLimit(`review:featured:${ip}`, 40, 10 * 60 * 1000);
  if (!lim.ok) {
    return NextResponse.json(
      { error: "Too many requests", items: [] as FeaturedCarouselItem[] },
      {
        status: 429,
        headers: { "Retry-After": String(lim.retryAfterSec) },
      }
    );
  }

  const items = await getFeaturedReviewItems();
  return NextResponse.json({ items });
}
