import React from "react";
import type { Metadata } from "next";
import HeroSection from "@/components/HeroSection";
import CarouselSection from "@/components/CarouselSection";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Get Honest Startup Feedback - SANDBOX",
  description:
    "What do people really think about your startup? Get brutally honest feedback by pasting your website URL. No sugar-coating, just real insights from experienced entrepreneurs.",
  openGraph: {
    title: "Get Honest Startup Feedback - SANDBOX",
    description:
      "What do people really think about your startup? Get brutally honest feedback by pasting your website URL.",
    url: "https://sandboxbd.com",
  },
  twitter: {
    title: "Get Honest Startup Feedback - SANDBOX",
    description:
      "What do people really think about your startup? Get brutally honest feedback by pasting your website URL.",
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