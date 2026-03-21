import React from "react";
import Image from "next/image";
import Link from "next/link";

type StartupCardProps = {
  logo?: string;
  name: string;
  summary: string;
  visits: number;
  valuation: string;
  /** When set, the whole card links to this path (e.g. `/feedback/{id}`). */
  href?: string;
};

const StartupCard: React.FC<StartupCardProps> = ({
  logo,
  name,
  summary,
  visits,
  valuation,
  href,
}) => {
  const inner = (
    <article className="h-full bg-white border border-[rgba(55,53,47,0.16)] rounded-md p-4 sm:p-5 md:p-6 hover:shadow-md transition-all cursor-pointer">
      {/* Logo and Name */}
      <header className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-md bg-[rgba(55,53,47,0.08)] flex items-center justify-center overflow-hidden flex-shrink-0">
          {logo && logo.trim() !== "" ? (
            <Image
              src={logo}
              alt={`${name} logo`}
              width={48}
              height={48}
              className="object-contain"
            />
          ) : (
            <span
              className="text-[#787774] font-semibold text-base sm:text-lg"
              aria-label={`${name} logo placeholder`}
            >
              {name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <h3 className="font-medium text-[#37352f] text-base sm:text-lg truncate">{name}</h3>
      </header>

      {/* Summary */}
      <p className="text-[#787774] text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2 leading-relaxed">{summary}</p>

      {/* Stats */}
      <dl className="flex items-center justify-between pt-3 sm:pt-4 border-t border-[rgba(55,53,47,0.09)]">
        <div className="flex flex-col">
          <dt className="text-xs text-[#9b9a97]">Visits</dt>
          <dd className="text-xs sm:text-sm font-medium text-[#37352f]">
            {visits.toLocaleString()}
          </dd>
        </div>
        <div className="flex flex-col items-end">
          <dt className="text-xs text-[#9b9a97]">Valuation</dt>
          <dd className="text-xs sm:text-sm font-medium text-[#37352f]">{valuation}</dd>
        </div>
      </dl>
    </article>
  );

  const wrapClass =
    "shrink-0 w-64 sm:w-72 md:w-80 rounded-md focus-within:ring-2 focus-within:ring-[rgba(249,115,22,0.35)] focus-within:ring-offset-2 focus-within:ring-offset-[#f7f6f3]";

  if (href) {
    return (
      <Link href={href} className={`${wrapClass} block no-underline text-inherit`}>
        {inner}
      </Link>
    );
  }

  return <div className={wrapClass}>{inner}</div>;
};

export default StartupCard;
