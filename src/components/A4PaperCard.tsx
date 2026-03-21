import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

type A4PaperCardProps = {
  logo?: string;
  name: string;
  summary: string;
  visits: number;
  valuation: string;
  websiteUrl: string;
  /** Internal link to SANDBOX feedback when this row is from Firestore. */
  feedbackHref?: string;
};

const A4PaperCard: React.FC<A4PaperCardProps> = ({
  logo,
  name,
  summary,
  visits,
  valuation,
  websiteUrl,
  feedbackHref,
}) => {
  return (
    <article
      className="w-full max-w-[210mm] bg-white border border-[rgba(55,53,47,0.16)] rounded-md p-6 sm:p-8 md:p-12 flex flex-col hover:shadow-lg transition-all h-full min-h-0"
      itemScope
      itemType="https://schema.org/Organization"
    >
      {/* Header Section */}
      <header className="shrink-0 flex items-start gap-4 sm:gap-6 mb-6 sm:mb-8 pb-4 sm:pb-6 border-b border-[rgba(55,53,47,0.09)]">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-md bg-[rgba(55,53,47,0.08)] flex items-center justify-center overflow-hidden border border-[rgba(55,53,47,0.16)] shrink-0">
          {logo && logo.trim() !== "" ? (
            <Image
              src={logo}
              alt={`${name} logo`}
              width={80}
              height={80}
              className="object-contain p-1.5 sm:p-2"
              itemProp="logo"
            />
          ) : (
            <span
              className="text-[#787774] font-semibold text-2xl sm:text-3xl"
              aria-label={`${name} logo placeholder`}
            >
              {name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl sm:text-3xl font-semibold text-[#37352f] mb-2 wrap-break-word" itemProp="name">
            {name}
          </h2>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <a
              href={websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 sm:gap-2 text-[#f97316] hover:text-[#ea580c] text-xs sm:text-sm font-normal transition-colors"
              itemProp="url"
              aria-label={`Visit ${name} website`}
            >
              Visit Website
              <ExternalLink
                size={12}
                className="sm:w-3.5 sm:h-3.5"
                aria-hidden="true"
              />
            </a>
            {feedbackHref && (
              <Link
                href={feedbackHref}
                className="text-xs sm:text-sm font-medium text-[#37352f] hover:text-[#f97316] underline-offset-2 hover:underline"
              >
                View SANDBOX review
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Summary — natural height; no fixed A4 aspect (that caused overlap on long copy) */}
      <div className="shrink-0 mb-6 sm:mb-8">
        <h3 className="text-xs sm:text-sm font-medium text-[#9b9a97] uppercase tracking-wide mb-2 sm:mb-3">
          About
        </h3>
        <p
          className="text-sm sm:text-base text-[#37352f] leading-relaxed wrap-break-word"
          itemProp="description"
        >
          {summary}
        </p>
      </div>

      {/* Fills extra row height so stats sit at bottom when grid stretches shorter cards */}
      <div className="min-h-0 flex-1" aria-hidden="true" />

      {/* Stats Section */}
      <div className="shrink-0 pt-4 sm:pt-6 border-t border-[rgba(55,53,47,0.09)]">
        <dl className="grid grid-cols-2 gap-4 sm:gap-6">
          <div>
            <dt className="text-xs font-medium text-[#9b9a97] uppercase tracking-wide mb-1.5 sm:mb-2">
              Total Visits
            </dt>
            <dd className="text-xl sm:text-2xl font-semibold text-[#37352f]">
              {visits.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-[#9b9a97] uppercase tracking-wide mb-1.5 sm:mb-2">
              Valuation
            </dt>
            <dd className="text-xl sm:text-2xl font-semibold text-[#37352f]">{valuation}</dd>
          </div>
        </dl>
      </div>

      {/* Footer */}
      <footer className="shrink-0 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-[rgba(55,53,47,0.06)]">
        <p className="text-xs text-[#9b9a97] text-center">
          Submitted to SandBox Gallery
        </p>
      </footer>
    </article>
  );
};

export default A4PaperCard;
