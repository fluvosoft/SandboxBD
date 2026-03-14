"use client";

import React, { useState } from "react";
import { Search } from "lucide-react";

const HeroSection: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle search logic here
    console.log("Searching for:", searchQuery);
  };

  return (
    <section className="w-full bg-[#f7f6f3] py-16 sm:py-20 md:py-24 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto text-center">
        {/* Heading */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-[#37352f] mb-4 sm:mb-6 px-2 leading-tight">
          What do people really think about your startup?
        </h1>

        {/* Description */}
        <p className="text-base sm:text-lg text-[#787774] mb-10 sm:mb-12 max-w-2xl mx-auto px-2 leading-relaxed">
          Stop wondering. Paste your website and get brutally honest feedback
          that actually helps you improve. No sugar-coating, no BS&apos;just real
          insights from people who&apos;ve been there. Ready to see what you&apos;re
          missing?
        </p>

        {/* Search Box */}
        <form
          onSubmit={handleSearch}
          className="max-w-2xl mx-auto px-2"
          aria-label="Search for startup feedback"
        >
          <div className="relative">
            <label htmlFor="website-url-input" className="sr-only">
              Enter your website URL to get feedback
            </label>
            <input
              id="website-url-input"
              type="url"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter your website URL and find out..."
              aria-label="Website URL"
              aria-describedby="search-description"
              className="w-full px-4 sm:px-5 py-3.5 sm:py-4 pr-12 sm:pr-14 text-sm sm:text-base bg-white border border-[rgba(55,53,47,0.16)] rounded-md text-[#37352f] placeholder-[#9b9a97] focus:outline-none focus:border-[#f97316] focus:ring-2 focus:ring-[rgba(249,115,22,0.15)] transition-all shadow-sm"
            />
            <button
              type="submit"
              aria-label="Submit website URL for feedback"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-[#37352f] text-white rounded-md hover:bg-[#2e2d29] transition-colors focus:outline-none focus:ring-2 focus:ring-[rgba(55,53,47,0.2)]"
            >
              <Search size={18} className="sm:w-5 sm:h-5" aria-hidden="true" />
            </button>
          </div>
          <p id="search-description" className="sr-only">
            Enter your startup website URL to receive honest feedback and reviews
          </p>
        </form>
      </div>
    </section>
  );
};

export default HeroSection;
