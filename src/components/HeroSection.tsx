"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { submitReview, saveReportToSession } from "@/lib/api";

const HeroSection: React.FC = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!searchQuery.trim()) {
      setError("Please enter a website URL");
      return;
    }

    try {
      const url = new URL(searchQuery.startsWith("http") ? searchQuery : `https://${searchQuery}`);
      setIsLoading(true);

      const result = await submitReview(url.toString());
      if (!result.ok) {
        setError(result.error || "Something went wrong. Please try again.");
        setIsLoading(false);
        return;
      }
      if (!result.report) {
        setError("No report returned. Please try again.");
        setIsLoading(false);
        return;
      }

      // Use backend-generated ID for the report page URL
      const feedbackId = result.report_id || Math.random().toString(36).substring(2, 11);
      saveReportToSession(feedbackId, result.report);
      router.push(`/feedback/${feedbackId}`);
    } catch (err) {
      setError("Could not reach the review service. Please try again.");
      setIsLoading(false);
    }
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
          onSubmit={handleSubmit}
          className="max-w-2xl mx-auto px-2"
          aria-label="Submit website for startup feedback"
        >
          <div className="relative">
            <label htmlFor="website-url-input" className="sr-only">
              Enter your website URL to get feedback
            </label>
            <input
              id="website-url-input"
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setError("");
              }}
              placeholder="Enter your website URL..."
              aria-label="Website URL"
              className={`w-full px-4 sm:px-5 py-3.5 sm:py-4 pr-12 sm:pr-14 text-sm sm:text-base bg-white border rounded-md text-[#37352f] placeholder-[#9b9a97] focus:outline-none focus:ring-2 transition-all shadow-sm ${
                error
                  ? "border-red-500 focus:border-red-500 focus:ring-[rgba(239,68,68,0.15)]"
                  : "border-[rgba(55,53,47,0.16)] focus:border-[#f97316] focus:ring-[rgba(249,115,22,0.15)]"
              }`}
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading}
              aria-label="Submit website URL for feedback"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-[#37352f] text-white rounded-md hover:bg-[#2e2d29] transition-colors focus:outline-none focus:ring-2 focus:ring-[rgba(55,53,47,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Search size={18} className="sm:w-5 sm:h-5" aria-hidden="true" />
              )}
            </button>
          </div>
          {error && (
            <p className="text-sm text-red-600 text-center" role="alert">
              {error}
            </p>
          )}
          <p id="search-description" className="sr-only">
            Enter your startup website URL to receive an honest feedback report
          </p>
          <p className="mt-4 text-center text-sm text-[#787774]">
            Already have a review?{" "}
            <Link href="/feedback/view" className="text-[#f97316] hover:underline">
              View by URL
            </Link>
          </p>
        </form>
      </div>
    </section>
  );
};

export default HeroSection;
