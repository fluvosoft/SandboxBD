"use client";

import React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink, ThumbsUp, ThumbsDown, MessageSquare, TrendingUp, Eye, Calendar } from "lucide-react";

const FeedbackPage = () => {
  const params = useParams();
  const feedbackId = params.id as string;

  // Demo data - replace with actual API call
  const feedbackData = {
    id: feedbackId,
    startupName: "TechFlow",
    websiteUrl: "https://techflow.example.com",
    submittedDate: "January 15, 2024",
    totalViews: 1250,
    overallRating: 4.2,
    feedbacks: [
      {
        id: 1,
        reviewer: "Sarah Chen",
        rating: 5,
        date: "2 days ago",
        comment: "Love the clean design and intuitive user interface. The onboarding process is smooth and the core features are well-executed. Great job on the UX!",
        helpful: 12,
        notHelpful: 2,
      },
      {
        id: 2,
        reviewer: "Michael Rodriguez",
        rating: 4,
        date: "3 days ago",
        comment: "Solid product with good potential. The pricing is competitive and the feature set is comprehensive. However, I noticed some performance issues on mobile devices that need attention.",
        helpful: 8,
        notHelpful: 1,
      },
      {
        id: 3,
        reviewer: "Emily Watson",
        rating: 3,
        date: "5 days ago",
        comment: "The concept is interesting but the execution needs work. The dashboard feels cluttered and some features are hard to find. Consider simplifying the navigation structure.",
        helpful: 5,
        notHelpful: 3,
      },
      {
        id: 4,
        reviewer: "David Kim",
        rating: 5,
        date: "1 week ago",
        comment: "Excellent platform! The integration capabilities are impressive and the customer support is responsive. This solves a real problem in the market.",
        helpful: 15,
        notHelpful: 0,
      },
      {
        id: 5,
        reviewer: "Jessica Martinez",
        rating: 4,
        date: "1 week ago",
        comment: "Good overall experience. The documentation is clear and the API is well-designed. Would love to see more customization options in the future.",
        helpful: 7,
        notHelpful: 1,
      },
    ],
    summary: {
      strengths: [
        "Clean and intuitive user interface",
        "Strong feature set",
        "Good customer support",
        "Competitive pricing",
      ],
      improvements: [
        "Mobile performance optimization needed",
        "Navigation could be simplified",
        "More customization options",
      ],
      averageRating: 4.2,
      totalFeedback: 5,
    },
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <span
        key={i}
        className={`text-lg ${
          i < rating ? "text-[#f97316]" : "text-[#e5e5e5]"
        }`}
      >
        ★
      </span>
    ));
  };

  return (
    <div className="min-h-screen bg-[#f7f6f3]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-[#787774] hover:text-[#37352f] mb-6 transition-colors"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Back to home
        </Link>

        {/* Header Section */}
        <div className="bg-white rounded-md shadow-sm border border-[rgba(55,53,47,0.16)] p-6 sm:p-8 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-semibold text-[#37352f] mb-2">
                {feedbackData.startupName}
              </h1>
              <a
                href={feedbackData.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[#f97316] hover:text-[#ea580c] text-sm font-medium transition-colors"
              >
                {feedbackData.websiteUrl}
                <ExternalLink size={14} aria-hidden="true" />
              </a>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="flex items-center gap-1 mb-1">
                  {renderStars(Math.round(feedbackData.overallRating))}
                </div>
                <p className="text-sm text-[#787774]">
                  {feedbackData.overallRating} / 5.0
                </p>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-[rgba(55,53,47,0.09)]">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[rgba(249,115,22,0.1)] rounded-md">
                <MessageSquare size={20} className="text-[#f97316]" />
              </div>
              <div>
                <p className="text-xs text-[#9b9a97]">Total Feedback</p>
                <p className="text-lg font-semibold text-[#37352f]">
                  {feedbackData.summary.totalFeedback}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[rgba(249,115,22,0.1)] rounded-md">
                <Eye size={20} className="text-[#f97316]" />
              </div>
              <div>
                <p className="text-xs text-[#9b9a97]">Total Views</p>
                <p className="text-lg font-semibold text-[#37352f]">
                  {feedbackData.totalViews.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[rgba(249,115,22,0.1)] rounded-md">
                <TrendingUp size={20} className="text-[#f97316]" />
              </div>
              <div>
                <p className="text-xs text-[#9b9a97]">Avg Rating</p>
                <p className="text-lg font-semibold text-[#37352f]">
                  {feedbackData.summary.averageRating}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[rgba(249,115,22,0.1)] rounded-md">
                <Calendar size={20} className="text-[#f97316]" />
              </div>
              <div>
                <p className="text-xs text-[#9b9a97]">Submitted</p>
                <p className="text-lg font-semibold text-[#37352f]">
                  {feedbackData.submittedDate.split(" ")[0]}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Section */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Strengths */}
          <div className="bg-white rounded-md shadow-sm border border-[rgba(55,53,47,0.16)] p-6">
            <h2 className="text-lg font-semibold text-[#37352f] mb-4 flex items-center gap-2">
              <ThumbsUp size={20} className="text-[#f97316]" />
              Strengths
            </h2>
            <ul className="space-y-2">
              {feedbackData.summary.strengths.map((strength, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-sm text-[#37352f]"
                >
                  <span className="text-[#f97316] mt-1">•</span>
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Areas for Improvement */}
          <div className="bg-white rounded-md shadow-sm border border-[rgba(55,53,47,0.16)] p-6">
            <h2 className="text-lg font-semibold text-[#37352f] mb-4 flex items-center gap-2">
              <TrendingUp size={20} className="text-[#f97316]" />
              Areas for Improvement
            </h2>
            <ul className="space-y-2">
              {feedbackData.summary.improvements.map((improvement, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-sm text-[#37352f]"
                >
                  <span className="text-[#f97316] mt-1">•</span>
                  <span>{improvement}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Feedback List */}
        <div className="bg-white rounded-md shadow-sm border border-[rgba(55,53,47,0.16)] p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-[#37352f] mb-6">
            All Feedback ({feedbackData.feedbacks.length})
          </h2>
          <div className="space-y-6">
            {feedbackData.feedbacks.map((feedback) => (
              <div
                key={feedback.id}
                className="pb-6 border-b border-[rgba(55,53,47,0.09)] last:border-0 last:pb-0"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-[rgba(249,115,22,0.1)] flex items-center justify-center flex-shrink-0">
                      <span className="text-[#f97316] font-semibold text-sm">
                        {feedback.reviewer.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-[#37352f]">
                        {feedback.reviewer}
                      </p>
                      <p className="text-xs text-[#9b9a97]">
                        {feedback.date}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {renderStars(feedback.rating)}
                  </div>
                </div>
                <p className="text-sm text-[#37352f] leading-relaxed mb-4 ml-13 sm:ml-0">
                  {feedback.comment}
                </p>
                <div className="flex items-center gap-4 ml-13 sm:ml-0">
                  <button className="flex items-center gap-1.5 text-xs text-[#787774] hover:text-[#37352f] transition-colors">
                    <ThumbsUp size={14} aria-hidden="true" />
                    Helpful ({feedback.helpful})
                  </button>
                  <button className="flex items-center gap-1.5 text-xs text-[#787774] hover:text-[#37352f] transition-colors">
                    <ThumbsDown size={14} aria-hidden="true" />
                    Not helpful ({feedback.notHelpful})
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackPage;
