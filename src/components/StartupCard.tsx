import React from "react";
import Image from "next/image";

type StartupCardProps = {
  logo?: string;
  name: string;
  summary: string;
  visits: number;
  valuation: string;
};

const StartupCard: React.FC<StartupCardProps> = ({
  logo,
  name,
  summary,
  visits,
  valuation,
}) => {
  return (
    <article className="flex-shrink-0 w-80 bg-white border border-slate-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
      {/* Logo and Name */}
      <header className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden">
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
              className="text-slate-400 font-bold text-lg"
              aria-label={`${name} logo placeholder`}
            >
              {name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <h3 className="font-semibold text-slate-900 text-lg">{name}</h3>
      </header>

      {/* Summary */}
      <p className="text-slate-600 text-sm mb-4 line-clamp-2">{summary}</p>

      {/* Stats */}
      <dl className="flex items-center justify-between pt-4 border-t border-slate-100">
        <div className="flex flex-col">
          <dt className="text-xs text-slate-500">Visits</dt>
          <dd className="text-sm font-medium text-slate-900">
            {visits.toLocaleString()}
          </dd>
        </div>
        <div className="flex flex-col items-end">
          <dt className="text-xs text-slate-500">Valuation</dt>
          <dd className="text-sm font-medium text-slate-900">{valuation}</dd>
        </div>
      </dl>
    </article>
  );
};

export default StartupCard;
