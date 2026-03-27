"use client";

import React, { useMemo, useState } from "react";
import { Search } from "lucide-react";
import A4PaperCard from "@/components/A4PaperCard";
import type { GalleryCardRow } from "@/lib/demo-startups";

function rowMatchesTitle(row: GalleryCardRow, raw: string): boolean {
  const q = raw.trim().toLowerCase();
  if (!q) return true;
  return row.name.toLowerCase().includes(q);
}

type GalleryContentProps = {
  rows: GalleryCardRow[];
};

const GalleryContent: React.FC<GalleryContentProps> = ({ rows }) => {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return rows.filter((r) => rowMatchesTitle(r, query));
  }, [rows, query]);

  const trimmed = query.trim();

  return (
    <>
      <div className="mb-8 sm:mb-10 max-w-md mx-auto w-full">
        <label htmlFor="gallery-search" className="sr-only">
          Search gallery by title
        </label>
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9b9a97]"
            aria-hidden
          />
          <input
            id="gallery-search"
            type="search"
            name="gallery-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title…"
            autoComplete="off"
            spellCheck={false}
            className="w-full rounded-md border border-[rgba(55,53,47,0.14)] bg-white py-2.5 pl-10 pr-3 text-sm text-[#37352f] placeholder:text-[#9b9a97] shadow-sm outline-none transition-[border-color,box-shadow] focus:border-[rgba(249,115,22,0.45)] focus:ring-2 focus:ring-[rgba(249,115,22,0.2)]"
          />
        </div>
        {trimmed ? (
          <p className="mt-2 text-center text-xs text-[#9b9a97]">
            {filtered.length === 0
              ? "No matches"
              : `${filtered.length} match${filtered.length === 1 ? "" : "es"}`}
          </p>
        ) : null}
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 md:gap-10 items-stretch">
        {filtered.length === 0 ? (
          <p className="col-span-full text-center text-sm text-[#787774] py-12">
            Try a different search term.
          </p>
        ) : (
          filtered.map((row) => (
            <A4PaperCard
              key={row.key}
              name={row.name}
              summary={row.summary}
              visits={row.visits}
              valuation={row.valuation}
              websiteUrl={row.websiteUrl}
              feedbackHref={row.feedbackHref}
              sandScore={row.sandScore}
            />
          ))
        )}
      </section>
    </>
  );
};

export default GalleryContent;
