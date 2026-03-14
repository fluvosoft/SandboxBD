import React from "react";
import Image from "next/image";
import { ExternalLink } from "lucide-react";

type A4PaperCardProps = {
  logo?: string;
  name: string;
  summary: string;
  visits: number;
  valuation: string;
  websiteUrl: string;
};

const A4PaperCard: React.FC<A4PaperCardProps> = ({
  logo,
  name,
  summary,
  visits,
  valuation,
  websiteUrl,
}) => {
  return (
    <div className="w-full max-w-[210mm] aspect-[210/297] bg-white border border-slate-300 shadow-lg rounded-sm p-8 md:p-12 flex flex-col hover:shadow-xl transition-shadow">
      {/* Header Section */}
      <div className="flex items-start gap-6 mb-8 pb-6 border-b border-slate-200">
        <div className="w-20 h-20 rounded-lg bg-slate-50 flex items-center justify-center overflow-hidden border border-slate-200 flex-shrink-0">
          {logo && logo.trim() !== "" ? (
            <Image
              src={logo}
              alt={name}
              width={80}
              height={80}
              className="object-contain p-2"
            />
          ) : (
            <span className="text-slate-400 font-bold text-3xl">
              {name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div className="flex-1">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">{name}</h2>
          <a
            href={websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
          >
            Visit Website
            <ExternalLink size={14} />
          </a>
        </div>
      </div>

      {/* Summary Section */}
      <div className="flex-1 mb-8">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
          About
        </h3>
        <p className="text-base text-slate-700 leading-relaxed">{summary}</p>
      </div>

      {/* Stats Section */}
      <div className="mt-auto pt-6 border-t border-slate-200">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
              Total Visits
            </p>
            <p className="text-2xl font-bold text-slate-900">
              {visits.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
              Valuation
            </p>
            <p className="text-2xl font-bold text-slate-900">{valuation}</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 pt-6 border-t border-slate-100">
        <p className="text-xs text-slate-400 text-center">
          Submitted to SandBox Gallery
        </p>
      </div>
    </div>
  );
};

export default A4PaperCard;
