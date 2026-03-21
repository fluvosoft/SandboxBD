import React from "react";
import type { Metadata } from "next";
import A4PaperCard from "@/components/A4PaperCard";

export const dynamic = "force-dynamic";
import {
  DEMO_STARTUP_RECORDS,
  mergeGalleryRows,
} from "@/lib/demo-startups";
import { getFeaturedReviewItems } from "@/lib/featured-reviews";

export const metadata: Metadata = {
  title: "Startup Gallery - Browse Reviewed Startups",
  description:
    "Explore startups reviewed on SANDBOX alongside well-known companies for context — real reviews from the community plus curated examples.",
  openGraph: {
    title: "Startup Gallery - Browse Reviewed Startups | SANDBOX",
    description:
      "Explore startups reviewed on SANDBOX and curated company examples.",
    url: "https://sandboxbd.com/gallery",
  },
  twitter: {
    title: "Startup Gallery - Browse Reviewed Startups",
    description:
      "Explore startups reviewed on SANDBOX and curated company examples.",
  },
  alternates: {
    canonical: "https://sandboxbd.com/gallery",
  },
};

const GalleryPage = async () => {
  const liveItems = await getFeaturedReviewItems();
  const rows = mergeGalleryRows(liveItems, DEMO_STARTUP_RECORDS);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Startup Gallery",
    description:
      "Startups reviewed on SANDBOX and curated technology company examples.",
    url: "https://sandboxbd.com/gallery",
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: rows.length,
      itemListElement: rows.map((row, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "Organization",
          name: row.name,
          description: row.summary.slice(0, 280),
          url: row.websiteUrl,
        },
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen bg-[#f7f6f3] py-8 sm:py-10 md:py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <header className="text-center mb-8 sm:mb-10 md:mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-[#37352f] mb-3 sm:mb-4 px-2">
              Startup Gallery
            </h1>
            <p className="text-base sm:text-lg text-[#787774] max-w-2xl mx-auto px-2 leading-relaxed">
              Sites reviewed on SANDBOX appear first; well-known technology
              companies are shown as contextual examples where they don&apos;t
              duplicate a live review.
            </p>
          </header>

          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 md:gap-10 items-stretch">
            {rows.map((row) => (
              <A4PaperCard
                key={row.key}
                name={row.name}
                summary={row.summary}
                visits={row.visits}
                valuation={row.valuation}
                websiteUrl={row.websiteUrl}
                feedbackHref={row.feedbackHref}
              />
            ))}
          </section>
        </div>
      </div>
    </>
  );
};

export default GalleryPage;
