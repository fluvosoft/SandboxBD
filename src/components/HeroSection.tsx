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
    <section className="w-full bg-white py-20 px-6">
      <div className="max-w-4xl mx-auto text-center">
        {/* Heading */}
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
          What do people really think about your startup?
        </h1>

        {/* Description */}
        <p className="text-lg text-slate-600 mb-10 max-w-2xl mx-auto">
          Stop wondering. Paste your website and get brutally honest feedback
          that actually helps you improve. No sugar-coating, no BS&apos;just real
          insights from people who&apos;ve been there. Ready to see what you&apos;re
          missing?
        </p>

        {/* Search Box */}
        <form
          onSubmit={handleSearch}
          className="max-w-2xl mx-auto"
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
              className="w-full px-6 py-4 pr-14 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-transparent shadow-sm transition-all"
            />
            <button
              type="submit"
              aria-label="Submit website URL for feedback"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2"
            >
              <Search size={20} aria-hidden="true" />
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
