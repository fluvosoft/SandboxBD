"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ExternalLink,
  ThumbsUp,
  ThumbsDown,
  TrendingUp,
  MessageSquare,
  Package,
  DollarSign,
  Megaphone,
  List,
  AlertTriangle,
  Users,
  Target,
  Eye,
} from "lucide-react";
import {
  getReportFromSession,
  getReportById,
  getReportByURL,
  isOpenLetter,
  isVCRoast,
  recordReviewView,
  type ReviewReport,
} from "@/lib/api";
import { sanitizeLetterPlainText } from "@/lib/letter-format";

/** Prevents duplicate view POSTs when React Strict Mode runs effects twice (dev). */
const recordingViewLock = new Set<string>();
/** Dedupes React Strict Mode double-mount and same-tick double effects (~2.5s). */
const recentViewPostAt = new Map<string, number>();
const VIEW_POST_DEDUP_MS = 2500;

const FeedbackPage = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const feedbackId = (params?.id as string) ?? "";
  const urlQuery = searchParams?.get("url") ?? "";
  const dailyLimitNotice = searchParams?.get("daily") === "1";
  const [report, setReport] = useState<ReviewReport | null | "loading">("loading");
  const [viewCount, setViewCount] = useState<number | null>(null);
  const [resolvedReviewId, setResolvedReviewId] = useState<string | null>(null);
  const [viewByUrlInput, setViewByUrlInput] = useState("");
  const [viewByUrlLoading, setViewByUrlLoading] = useState(false);
  const [viewByUrlError, setViewByUrlError] = useState("");

  useEffect(() => {
    setViewCount(null);
    setResolvedReviewId(null);

    if (urlQuery) {
      void getReportByURL(urlQuery).then((fetched) => {
        if (fetched) {
          setReport(fetched.report);
          setViewCount(fetched.viewCount);
          setResolvedReviewId(fetched.reportId ?? null);
        } else {
          setReport(null);
        }
      });
      return;
    }
    const stored = getReportFromSession(feedbackId);
    if (stored) {
      setReport(stored);
      setResolvedReviewId(feedbackId || null);
      return;
    }
    if (!feedbackId) {
      setReport(null);
      return;
    }
    void getReportById(feedbackId).then((fetched) => {
      if (fetched) {
        setReport(fetched.report);
        setViewCount(fetched.viewCount);
        setResolvedReviewId(feedbackId);
      } else {
        setReport(null);
      }
    });
  }, [feedbackId, urlQuery]);

  useEffect(() => {
    if (report === "loading" || report === null) return;
    const id = resolvedReviewId;
    if (!id || !/^[a-f0-9]{16,64}$/i.test(id)) return;
    if (typeof window === "undefined") return;

    const now = Date.now();
    const last = recentViewPostAt.get(id) ?? 0;
    if (now - last < VIEW_POST_DEDUP_MS) {
      void getReportById(id).then((meta) => {
        if (meta) setViewCount(meta.viewCount);
      });
      return;
    }
    recentViewPostAt.set(id, now);

    if (recordingViewLock.has(id)) return;
    recordingViewLock.add(id);

    void (async () => {
      try {
        const meta = await getReportById(id);
        if (meta) setViewCount(meta.viewCount);
        const n = await recordReviewView(id);
        if (n != null) setViewCount(n);
        else void getReportById(id).then((m) => m && setViewCount(m.viewCount));
      } finally {
        recordingViewLock.delete(id);
      }
    })();
  }, [report, resolvedReviewId]);

  // Demo data for direct visits / no report in session
  const demoData = {
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
        comment:
          "Love the clean design and intuitive user interface. The onboarding process is smooth and the core features are well-executed. Great job on the UX!",
        helpful: 12,
        notHelpful: 2,
      },
      {
        id: 2,
        reviewer: "Michael Rodriguez",
        rating: 4,
        date: "3 days ago",
        comment:
          "Solid product with good potential. The pricing is competitive and the feature set is comprehensive. However, I noticed some performance issues on mobile devices that need attention.",
        helpful: 8,
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
    },
  };

  const renderStars = (rating: number) =>
    Array.from({ length: 5 }).map((_, i) => (
      <span
        key={i}
        className={`text-lg ${i < rating ? "text-[#f97316]" : "text-[#e5e5e5]"}`}
      >
        ★
      </span>
    ));

  if (report === "loading") {
    return (
      <div className="min-h-screen bg-[#f7f6f3] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#f97316] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Backend report view
  if (report) {
    let title = report.title || "Startup Review";
    try {
      title = report.title || new URL(report.url).hostname || title;
    } catch {
      /* use title as set */
    }

    // Open letter layout: single long-form letter, no section cards
    if (isOpenLetter(report)) {
      const letterBody = sanitizeLetterPlainText(report.letter || "");
      let hostLabel = report.url;
      try {
        hostLabel = new URL(report.url).hostname;
      } catch {
        /* keep url */
      }

      return (
        <div className="min-h-screen bg-[#f7f6f3]">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
            {dailyLimitNotice && (
              <p
                className="mb-4 rounded-md border border-[rgba(55,53,47,0.16)] bg-white px-4 py-3 text-sm text-[#37352f]"
                role="status"
              >
                This website was already analyzed today. One fresh AI analysis per URL per calendar day (UTC) — showing your existing report.
              </p>
            )}
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-[#787774] hover:text-[#37352f] mb-6 transition-colors"
            >
              <ArrowLeft size={16} aria-hidden="true" />
              Back to home
            </Link>

            <article
              className="bg-white rounded-md shadow-sm border border-[rgba(55,53,47,0.16)] overflow-hidden"
              aria-label="Review letter"
            >
              <div className="border-b border-[rgba(55,53,47,0.09)] bg-[#fafafa] px-6 sm:px-8 py-4 sm:py-5 text-sm text-[#37352f] space-y-1.5">
                <div>
                  <span className="text-[#787774] w-20 inline-block">From</span>
                  <span className="font-medium">SANDBOX Review</span>
                </div>
                <div>
                  <span className="text-[#787774] w-20 inline-block">Subject</span>
                  <span className="font-medium">{title}</span>
                </div>
                <div>
                  <span className="text-[#787774] w-20 inline-block">Re</span>
                  <a
                    href={report.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#f97316] hover:text-[#ea580c] font-medium inline-flex items-center gap-1.5"
                  >
                    {hostLabel}
                    <ExternalLink size={12} aria-hidden="true" />
                  </a>
                </div>
                {resolvedReviewId && (
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[#787774] w-20 inline-block shrink-0">
                      Views
                    </span>
                    <span className="font-medium tabular-nums text-[#37352f] inline-flex items-center gap-1.5">
                      <Eye size={14} className="text-[#9b9a97]" aria-hidden />
                      {viewCount === null ? "…" : viewCount.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
              <div className="px-6 sm:px-8 py-8 sm:py-10">
                <div className="text-[#37352f] text-[15px] leading-[1.75] whitespace-pre-wrap font-serif">
                  {letterBody}
                </div>
              </div>
            </article>
          </div>
        </div>
      );
    }

    // VC roast layout (sectioned)
    if (isVCRoast(report)) {
      return (
        <div className="min-h-screen bg-[#f7f6f3]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
            {dailyLimitNotice && (
              <p
                className="mb-4 rounded-md border border-[rgba(55,53,47,0.16)] bg-white px-4 py-3 text-sm text-[#37352f]"
                role="status"
              >
                This website was already analyzed today. One fresh AI analysis per URL per calendar day (UTC) — showing your existing report.
              </p>
            )}
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-[#787774] hover:text-[#37352f] mb-6 transition-colors"
            >
              <ArrowLeft size={16} aria-hidden="true" />
              Back to home
            </Link>

            <div className="bg-white rounded-md shadow-sm border border-[rgba(55,53,47,0.16)] p-6 sm:p-8 mb-6">
              <div className="mb-6">
                <h1 className="text-3xl sm:text-4xl font-semibold text-[#37352f] mb-2">
                  {title}
                </h1>
                <a
                  href={report.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[#f97316] hover:text-[#ea580c] text-sm font-medium transition-colors"
                >
                  {report.url}
                  <ExternalLink size={14} aria-hidden="true" />
                </a>
                {resolvedReviewId && (
                  <p className="mt-3 flex items-center gap-2 text-sm text-[#787774]">
                    <Eye size={16} className="text-[#9b9a97] shrink-0" aria-hidden />
                    <span className="tabular-nums text-[#37352f] font-medium">
                      {viewCount === null
                        ? "…"
                        : `${viewCount.toLocaleString()} view${viewCount === 1 ? "" : "s"}`}
                    </span>
                  </p>
                )}
              </div>
            </div>

            {report.startup_claim && (
              <div className="bg-white rounded-md shadow-sm border border-[rgba(55,53,47,0.16)] p-6 mb-6">
                <h2 className="text-lg font-semibold text-[#37352f] mb-3">Startup Claim</h2>
                <p className="text-[#37352f] leading-relaxed text-sm whitespace-pre-wrap">{report.startup_claim}</p>
              </div>
            )}

            {report.what_it_actually_looks_like && (
              <div className="bg-white rounded-md shadow-sm border border-[rgba(55,53,47,0.16)] p-6 mb-6">
                <h2 className="text-lg font-semibold text-[#37352f] mb-3">What It Actually Looks Like</h2>
                <p className="text-[#37352f] leading-relaxed text-sm whitespace-pre-wrap">{report.what_it_actually_looks_like}</p>
              </div>
            )}

            {report.the_roast && (
              <div className="bg-white rounded-md shadow-sm border border-[rgba(239,68,68,0.3)] p-6 mb-6">
                <h2 className="text-lg font-semibold text-[#37352f] mb-3">The Roast</h2>
                <p className="text-[#37352f] leading-relaxed text-sm whitespace-pre-wrap">{report.the_roast}</p>
              </div>
            )}

            {(report.red_flags?.length ?? 0) > 0 && (
              <div className="bg-white rounded-md shadow-sm border border-[rgba(55,53,47,0.16)] p-6 mb-6">
                <h2 className="text-lg font-semibold text-[#37352f] mb-4 flex items-center gap-2">
                  <AlertTriangle size={20} className="text-[#f97316]" />
                  Red Flags Investors Will Notice Immediately
                </h2>
                <ul className="space-y-2">
                  {report.red_flags!.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-[#37352f]">
                      <span className="text-[#f97316] mt-1">•</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {report.product_reality_check && (
              <div className="bg-white rounded-md shadow-sm border border-[rgba(55,53,47,0.16)] p-6 mb-6">
                <h2 className="text-lg font-semibold text-[#37352f] mb-3">Product Reality Check</h2>
                <p className="text-[#37352f] leading-relaxed text-sm whitespace-pre-wrap">{report.product_reality_check}</p>
              </div>
            )}

            {report.business_model_reality_check && (
              <div className="bg-white rounded-md shadow-sm border border-[rgba(55,53,47,0.16)] p-6 mb-6">
                <h2 className="text-lg font-semibold text-[#37352f] mb-3">Business Model Reality Check</h2>
                <p className="text-[#37352f] leading-relaxed text-sm whitespace-pre-wrap">{report.business_model_reality_check}</p>
              </div>
            )}

            {(report.investor_rejection_reasons?.length ?? 0) > 0 && (
              <div className="bg-white rounded-md shadow-sm border border-[rgba(55,53,47,0.16)] p-6 mb-6">
                <h2 className="text-lg font-semibold text-[#37352f] mb-4 flex items-center gap-2">
                  <Users size={20} className="text-[#f97316]" />
                  Investor Rejection Reasons
                </h2>
                <ul className="space-y-2">
                  {report.investor_rejection_reasons!.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-[#37352f]">
                      <span className="text-[#f97316] mt-1">•</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {(report.what_would_actually_fix_this?.length ?? 0) > 0 && (
              <div className="bg-white rounded-md shadow-sm border border-[rgba(55,53,47,0.16)] p-6 mb-6">
                <h2 className="text-lg font-semibold text-[#37352f] mb-4 flex items-center gap-2">
                  <Target size={20} className="text-[#f97316]" />
                  What Would Actually Fix This
                </h2>
                <ul className="space-y-2">
                  {report.what_would_actually_fix_this!.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-[#37352f]">
                      <span className="text-[#f97316] mt-1">•</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      );
    }

    // Legacy report layout
    return (
      <div className="min-h-screen bg-[#f7f6f3]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          {dailyLimitNotice && (
            <p
              className="mb-4 rounded-md border border-[rgba(55,53,47,0.16)] bg-white px-4 py-3 text-sm text-[#37352f]"
              role="status"
            >
              This website was already analyzed today. One fresh AI analysis per URL per calendar day (UTC) — showing your existing report.
            </p>
          )}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-[#787774] hover:text-[#37352f] mb-6 transition-colors"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Back to home
          </Link>

          <div className="bg-white rounded-md shadow-sm border border-[rgba(55,53,47,0.16)] p-6 sm:p-8 mb-6">
            <div className="mb-6">
              <h1 className="text-3xl sm:text-4xl font-semibold text-[#37352f] mb-2">
                {title}
              </h1>
              <a
                href={report.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[#f97316] hover:text-[#ea580c] text-sm font-medium transition-colors"
              >
                {report.url}
                <ExternalLink size={14} aria-hidden="true" />
              </a>
              {resolvedReviewId && (
                <p className="mt-3 flex items-center gap-2 text-sm text-[#787774]">
                  <Eye size={16} className="text-[#9b9a97] shrink-0" aria-hidden />
                  <span className="tabular-nums text-[#37352f] font-medium">
                    {viewCount === null
                      ? "…"
                      : `${viewCount.toLocaleString()} view${viewCount === 1 ? "" : "s"}`}
                  </span>
                </p>
              )}
            </div>
            {report.summary && (
              <p className="text-[#37352f] leading-relaxed mb-6">{report.summary}</p>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-md shadow-sm border border-[rgba(55,53,47,0.16)] p-6">
              <h2 className="text-lg font-semibold text-[#37352f] mb-4 flex items-center gap-2">
                <ThumbsUp size={20} className="text-[#f97316]" />
                Strengths
              </h2>
              <ul className="space-y-2">
                {(report.strengths || []).map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-[#37352f]">
                    <span className="text-[#f97316] mt-1">•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white rounded-md shadow-sm border border-[rgba(55,53,47,0.16)] p-6">
              <h2 className="text-lg font-semibold text-[#37352f] mb-4 flex items-center gap-2">
                <ThumbsDown size={20} className="text-[#f97316]" />
                Weaknesses
              </h2>
              <ul className="space-y-2">
                {(report.weaknesses || []).map((w, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-[#37352f]">
                    <span className="text-[#f97316] mt-1">•</span>
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-md shadow-sm border border-[rgba(55,53,47,0.16)] p-6 mb-6">
            <h2 className="text-lg font-semibold text-[#37352f] mb-4 flex items-center gap-2">
              <TrendingUp size={20} className="text-[#f97316]" />
              Improvement suggestions
            </h2>
            <ul className="space-y-2">
              {(report.improvement_suggestions || []).map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-[#37352f]">
                  <span className="text-[#f97316] mt-1">•</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>

          {(report.market_risks?.length ?? 0) > 0 && (
            <div className="bg-white rounded-md shadow-sm border border-[rgba(55,53,47,0.16)] p-6 mb-6">
              <h2 className="text-lg font-semibold text-[#37352f] mb-4 flex items-center gap-2">
                <AlertTriangle size={20} className="text-[#f97316]" />
                Market risks
              </h2>
              <ul className="space-y-2">
                {report.market_risks!.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-[#37352f]">
                    <span className="text-[#f97316] mt-1">•</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {(report.investor_concerns?.length ?? 0) > 0 && (
            <div className="bg-white rounded-md shadow-sm border border-[rgba(55,53,47,0.16)] p-6 mb-6">
              <h2 className="text-lg font-semibold text-[#37352f] mb-4 flex items-center gap-2">
                <Users size={20} className="text-[#f97316]" />
                Investor concerns
              </h2>
              <ul className="space-y-2">
                {report.investor_concerns!.map((c, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-[#37352f]">
                    <span className="text-[#f97316] mt-1">•</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {(report.founder_suggestions?.length ?? 0) > 0 && (
            <div className="bg-white rounded-md shadow-sm border border-[rgba(55,53,47,0.16)] p-6 mb-6">
              <h2 className="text-lg font-semibold text-[#37352f] mb-4 flex items-center gap-2">
                <Target size={20} className="text-[#f97316]" />
                Founder-level suggestions
              </h2>
              <ul className="space-y-2">
                {report.founder_suggestions!.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-[#37352f]">
                    <span className="text-[#f97316] mt-1">•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-6">
            {report.product_overview && (
              <div className="bg-white rounded-md shadow-sm border border-[rgba(55,53,47,0.16)] p-6">
                <h2 className="text-sm font-semibold text-[#37352f] mb-2 flex items-center gap-2">
                  <Package size={18} className="text-[#f97316]" />
                  Product
                </h2>
                <p className="text-sm text-[#37352f]">{report.product_overview}</p>
              </div>
            )}
            {report.pricing_overview && (
              <div className="bg-white rounded-md shadow-sm border border-[rgba(55,53,47,0.16)] p-6">
                <h2 className="text-sm font-semibold text-[#37352f] mb-2 flex items-center gap-2">
                  <DollarSign size={18} className="text-[#f97316]" />
                  Pricing
                </h2>
                <p className="text-sm text-[#37352f]">{report.pricing_overview}</p>
              </div>
            )}
            {report.messaging_overview && (
              <div className="bg-white rounded-md shadow-sm border border-[rgba(55,53,47,0.16)] p-6">
                <h2 className="text-sm font-semibold text-[#37352f] mb-2 flex items-center gap-2">
                  <Megaphone size={18} className="text-[#f97316]" />
                  Messaging
                </h2>
                <p className="text-sm text-[#37352f]">{report.messaging_overview}</p>
              </div>
            )}
          </div>

          {(report.features?.length ?? 0) > 0 && (
            <div className="bg-white rounded-md shadow-sm border border-[rgba(55,53,47,0.16)] p-6 mt-6">
              <h2 className="text-lg font-semibold text-[#37352f] mb-4 flex items-center gap-2">
                <List size={20} className="text-[#f97316]" />
                Features
              </h2>
              <ul className="space-y-1">
                {report.features!.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-[#37352f]">
                    <span className="text-[#f97316]">•</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  }

  // No report in session: show demo or prompt
  return (
    <div className="min-h-screen bg-[#f7f6f3]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-[#787774] hover:text-[#37352f] mb-6 transition-colors"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Back to home
        </Link>
        <div className="bg-white rounded-md shadow-sm border border-[rgba(55,53,47,0.16)] p-6 sm:p-8 mb-6 text-center">
          <MessageSquare size={48} className="text-[#9b9a97] mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-[#37352f] mb-2">
            No report for this link
          </h2>
          <p className="text-[#787774] mb-6">
            Submit your startup URL on the home page to get an AI-generated review, or paste a website URL below to view the latest stored review.
          </p>
          <div className="max-w-md mx-auto mb-6">
            <label htmlFor="view-by-url" className="sr-only">Paste website URL to view latest review</label>
            <div className="flex gap-2">
              <input
                id="view-by-url"
                type="text"
                value={viewByUrlInput}
                onChange={(e) => { setViewByUrlInput(e.target.value); setViewByUrlError(""); }}
                placeholder="Paste website URL to view latest review"
                className="flex-1 px-4 py-2 border border-[rgba(55,53,47,0.16)] rounded-md text-sm"
              />
              <button
                type="button"
                disabled={viewByUrlLoading}
                onClick={async () => {
                  const u = viewByUrlInput.trim();
                  if (!u) return;
                  setViewByUrlLoading(true);
                  setViewByUrlError("");
                  const fetched = await getReportByURL(u);
                  setViewByUrlLoading(false);
                  if (fetched) {
                    setReport(fetched.report);
                    setViewCount(fetched.viewCount);
                    setResolvedReviewId(fetched.reportId ?? null);
                  } else setViewByUrlError("No review found for this URL.");
                }}
                className="px-4 py-2 bg-[#f97316] text-white rounded-md hover:bg-[#ea580c] disabled:opacity-50 text-sm font-medium"
              >
                {viewByUrlLoading ? "Loading…" : "View review"}
              </button>
            </div>
            {viewByUrlError && <p className="mt-2 text-sm text-red-600">{viewByUrlError}</p>}
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#37352f] text-white rounded-md hover:bg-[#2e2d29] transition-colors"
          >
            Get a new review
          </Link>
        </div>
        <div className="bg-white rounded-md shadow-sm border border-[rgba(55,53,47,0.16)] p-6">
          <h3 className="text-lg font-semibold text-[#37352f] mb-4">Sample feedback (demo)</h3>
          <div className="flex items-center gap-4 mb-4">
            {renderStars(Math.round(demoData.overallRating))}
            <span className="text-[#787774]">{demoData.overallRating} / 5.0</span>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-[#37352f] mb-2">Strengths</h4>
              <ul className="space-y-1 text-sm text-[#37352f]">
                {demoData.summary.strengths.map((s, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-[#f97316]">•</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-[#37352f] mb-2">Areas for improvement</h4>
              <ul className="space-y-1 text-sm text-[#37352f]">
                {demoData.summary.improvements.map((s, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-[#f97316]">•</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-[rgba(55,53,47,0.09)] space-y-4">
            {demoData.feedbacks.slice(0, 2).map((f) => (
              <div key={f.id}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-[#37352f]">{f.reviewer}</span>
                  {renderStars(f.rating)}
                </div>
                <p className="text-sm text-[#787774]">{f.comment}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackPage;
