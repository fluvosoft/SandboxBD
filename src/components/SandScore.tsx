"use client";

import React, { useId, useState } from "react";
import { ChevronDown, Info } from "lucide-react";

type Pillars = {
  positioning_icp: number;
  wedge_moat: number;
  gtm_distribution: number;
  pricing_business_model: number;
  trust_ux: number;
};

type SandScoreProps = {
  sandScore: number;
  band: "High Risk" | "Needs Work" | "Promising" | "Strong";
  pillars: Pillars;
};

const PILLAR_ROWS: Array<{ key: keyof Pillars; label: string }> = [
  { key: "positioning_icp", label: "Positioning & ICP" },
  { key: "wedge_moat", label: "Wedge & Moat" },
  { key: "gtm_distribution", label: "GTM & Distribution" },
  { key: "pricing_business_model", label: "Pricing & Business Model" },
  { key: "trust_ux", label: "Trust & UX" },
];

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

const SandScore: React.FC<SandScoreProps> = ({ sandScore, band, pillars }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const tooltipId = useId();
  const panelId = useId();

  return (
    <section className="relative bg-white rounded-md shadow-sm border border-[rgba(55,53,47,0.16)] p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-sm sm:text-base lg:text-lg font-semibold text-[#37352f]">
            Sand Score
          </h2>
          <div className="relative">
            <button
              type="button"
              aria-label="What is Sand Score?"
              aria-expanded={showTooltip}
              aria-describedby={showTooltip ? tooltipId : undefined}
              onClick={() => setShowTooltip((v) => !v)}
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              onFocus={() => setShowTooltip(true)}
              onBlur={() => setShowTooltip(false)}
              className="inline-flex items-center justify-center w-6 h-6 rounded-full text-[#787774] hover:text-[#37352f] hover:bg-[rgba(55,53,47,0.06)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(249,115,22,0.35)] focus-visible:ring-offset-2"
            >
              <Info size={14} aria-hidden="true" />
            </button>
            {showTooltip && (
              <div
                id={tooltipId}
                role="tooltip"
                className="absolute left-0 bottom-full mb-2 z-20 w-72 rounded-md border border-[rgba(55,53,47,0.14)] bg-white p-3 text-xs sm:text-sm text-[#37352f] shadow-lg"
              >
                <p>
                  Sand Score is our 0-100 snapshot of your startup&apos;s
                  positioning, GTM, pricing, and trust signals.
                </p>
                <p className="mt-1 text-[#787774]">
                  Bands: High Risk 0-39, Needs Work 40-59, Promising 60-79,
                  Strong 80-100.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="inline-flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-md bg-[rgba(249,115,22,0.14)] text-[#ea580c] text-xs font-semibold">
            {band}
          </span>
          <span className="tabular-nums text-lg sm:text-xl font-semibold text-[#37352f]">
            {sandScore}/100
          </span>
        </div>
      </div>

      <div
        className="mt-3"
        onMouseEnter={() => setShowBreakdown(true)}
        onMouseLeave={() => setShowBreakdown(false)}
      >
        <button
          type="button"
          aria-expanded={showBreakdown}
          aria-controls={panelId}
          onClick={() => setShowBreakdown((v) => !v)}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#f97316] hover:text-[#ea580c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(249,115,22,0.35)] focus-visible:ring-offset-2 rounded"
        >
          View breakdown
          <ChevronDown
            size={16}
            className={`transition-transform ${showBreakdown ? "rotate-180" : ""}`}
            aria-hidden="true"
          />
        </button>
      </div>

      {showBreakdown && (
        <div
          id={panelId}
          role="region"
          aria-label="Sand Score pillar breakdown"
          className="mt-3 rounded-md border border-[rgba(55,53,47,0.12)] bg-[#fafafa] p-3 sm:p-4"
        >
          <div className="space-y-2.5">
            {PILLAR_ROWS.map((row) => {
              const value = clamp(Number(pillars[row.key] ?? 0), 0, 10);
              const pct = `${(value / 10) * 100}%`;
              return (
                <div key={row.key} className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-1">
                  <p className="text-sm text-[#37352f]">{row.label}</p>
                  <p className="text-sm font-medium text-[#37352f] tabular-nums">
                    {value} / 10
                  </p>
                  <div className="col-span-2 h-2 rounded-full bg-[rgba(55,53,47,0.12)] overflow-hidden">
                    <div
                      className="h-full bg-[#f97316]"
                      style={{ width: pct }}
                      aria-hidden="true"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
};

export default SandScore;
