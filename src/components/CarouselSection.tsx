"use client";

import React from "react";
import StartupCard from "./StartupCard";

type Startup = {
  logo: string;
  name: string;
  summary: string;
  visits: number;
  valuation: string;
};

const CarouselSection: React.FC = () => {
  // Sample data - replace with actual data from API/database
  const startups: Startup[] = [
    {
      logo: "",
      name: "TechFlow",
      summary:
        "Revolutionary project management tool that helps teams collaborate seamlessly.",
      visits: 12500,
      valuation: "$2.5M",
    },
    {
      logo: "",
      name: "DataSync",
      summary:
        "AI-powered data synchronization platform for modern businesses.",
      visits: 8900,
      valuation: "$1.8M",
    },
    {
      logo: "",
      name: "CloudVault",
      summary:
        "Secure cloud storage solution with enterprise-grade encryption.",
      visits: 15200,
      valuation: "$3.2M",
    },
    {
      logo: "",
      name: "CodeCraft",
      summary:
        "Developer tools platform that streamlines the coding workflow.",
      visits: 9800,
      valuation: "$2.1M",
    },
    {
      logo: "",
      name: "MarketPulse",
      summary:
        "Real-time market analytics platform for traders and investors.",
      visits: 11200,
      valuation: "$2.9M",
    },
    {
      logo: "",
      name: "DesignHub",
      summary:
        "Collaborative design platform for creative teams and agencies.",
      visits: 7600,
      valuation: "$1.5M",
    },
    {
      logo: "",
      name: "FinanceWise",
      summary:
        "Personal finance management app with smart budgeting features.",
      visits: 13400,
      valuation: "$2.7M",
    },
    {
      logo: "",
      name: "HealthTrack",
      summary:
        "Comprehensive health monitoring platform for individuals and clinics.",
      visits: 10100,
      valuation: "$2.3M",
    },
  ];

  // Duplicate the array for seamless infinite scroll
  const duplicatedStartups = [...startups, ...startups];

  return (
    <section className="w-full bg-white py-12 overflow-hidden">
      {/* First Row - Right to Left */}
      <div className="mb-8">
        <div className="flex gap-6 animate-scroll-right">
          {duplicatedStartups.map((startup, index) => (
            <StartupCard key={`row1-${index}`} {...startup} />
          ))}
        </div>
      </div>

      {/* Second Row - Left to Right */}
      <div>
        <div className="flex gap-6 animate-scroll-left">
          {duplicatedStartups.map((startup, index) => (
            <StartupCard key={`row2-${index}`} {...startup} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default CarouselSection;
