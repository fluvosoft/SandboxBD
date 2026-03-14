import React from "react";
import type { Metadata } from "next";
import HeroSection from "@/components/HeroSection";
import CarouselSection from "@/components/CarouselSection";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Browse Startups - Get Honest Feedback",
  description:
    "Browse innovative startups and get brutally honest feedback. Discover what people really think about startups. Paste your website URL for honest insights from experienced entrepreneurs.",
  openGraph: {
    title: "Browse Startups - Get Honest Feedback | SANDBOX",
    description:
      "Browse innovative startups and get brutally honest feedback. Discover what people really think.",
    url: "https://sandboxbd.com",
  },
  twitter: {
    title: "Browse Startups - Get Honest Feedback",
    description:
      "Browse innovative startups and get brutally honest feedback. Discover what people really think.",
  },
  alternates: {
    canonical: "https://sandboxbd.com",
  },
};

const page = () => {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "SANDBOX - Get Honest Startup Feedback",
    description:
      "Get brutally honest feedback about your startup. Paste your website URL and receive real insights.",
    url: "https://sandboxbd.com",
    mainEntity: {
      "@type": "Service",
      serviceType: "Startup Feedback Platform",
      description:
        "Platform for startups to receive honest feedback and reviews from experienced entrepreneurs",
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