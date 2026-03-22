import React from "react";
import type { Metadata } from "next";
import HeroSection from "@/components/HeroSection";
import CarouselSection from "@/components/CarouselSection";
import Footer from "@/components/Footer";
import { getSiteUrl } from "@/lib/site-url";

const siteUrl = getSiteUrl();

const homeDescription =
  "Looking for startup Bangladesh insights or a Sandbox BD-style review? SANDBOX (Sanbox) gives honest startup feedback, a live gallery, and URL-based reports for founders in Bangladesh and worldwide.";

export const metadata: Metadata = {
  title: "Startup Bangladesh reviews & honest feedback | SANDBOX",
  description: homeDescription,
  openGraph: {
    title: "Startup Bangladesh reviews & honest feedback | SANDBOX",
    description: homeDescription,
    url: siteUrl,
  },
  twitter: {
    title: "Startup Bangladesh reviews & honest feedback | SANDBOX",
    description: homeDescription,
  },
  alternates: {
    canonical: siteUrl,
  },
};

const page = () => {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "SANDBOX - startup feedback & reviews (Bangladesh & global)",
    description: homeDescription,
    url: siteUrl,
    isPartOf: { "@id": `${siteUrl}/#website` },
    mainEntity: {
      "@type": "Service",
      name: "Startup feedback and reviews",
      serviceType: "Startup feedback platform",
      areaServed: ["Bangladesh", "Worldwide"],
      description:
        "Honest startup reviews and feedback for Bangladesh founders and global startups; browse the gallery or submit your website URL.",
      provider: { "@id": `${siteUrl}/#organization` },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main>
        <HeroSection />
        <CarouselSection />
        <Footer />
      </main>
    </>
  );
};

export default page;