"use client";

import React, { useEffect, useMemo, useState } from "react";
import StartupCard from "./StartupCard";
import {
  getFeaturedCarouselItems,
  type FeaturedCarouselItem,
} from "@/lib/api";
import {
  DEMO_STARTUP_RECORDS,
  filterDemosNotCoveredByLive,
  type DemoStartupRecord,
} from "@/lib/demo-startups";

const MIN_LIVE_BEFORE_DEMO_OFF = 8;
const MAX_UNIQUE_CARDS = 24;

type CarouselCard = {
  key: string;
  logo: string;
  name: string;
  summary: string;
  visits: number;
  valuation: string;
  href?: string;
};

function liveToCard(item: FeaturedCarouselItem): CarouselCard {
  return {
    key: `live-${item.id}`,
    logo: "",
    name: item.name,
    summary: item.summary,
    visits: item.visits,
    valuation: item.valuation,
    href: `/feedback/${item.id}`,
  };
}

function demoToCard(s: DemoStartupRecord, index: number): CarouselCard {
  return {
    key: `demo-${s.name}-${index}`,
    logo: "",
    name: s.name,
    summary: s.shortSummary,
    visits: s.visits,
    valuation: s.valuation,
  };
}

function mergeLiveWithDemo(live: FeaturedCarouselItem[]): CarouselCard[] {
  const demosPool = filterDemosNotCoveredByLive(DEMO_STARTUP_RECORDS, live);
  const mappedLive = live.map(liveToCard);

  if (mappedLive.length >= MIN_LIVE_BEFORE_DEMO_OFF) {
    return mappedLive.slice(0, MAX_UNIQUE_CARDS);
  }

  const needDemo = Math.max(0, MIN_LIVE_BEFORE_DEMO_OFF - mappedLive.length);
  const demoSlice = demosPool.slice(0, needDemo).map(demoToCard);
  return [...mappedLive, ...demoSlice].slice(0, MAX_UNIQUE_CARDS);
}

const CarouselSection: React.FC = () => {
  const [liveItems, setLiveItems] = useState<FeaturedCarouselItem[] | null>(
    null
  );

  useEffect(() => {
    let cancelled = false;
    void getFeaturedCarouselItems().then((items) => {
      if (!cancelled) setLiveItems(items);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const cards = useMemo((): CarouselCard[] => {
    if (liveItems === null) {
      return DEMO_STARTUP_RECORDS.map((s, i) => demoToCard(s, i));
    }
    return mergeLiveWithDemo(liveItems);
  }, [liveItems]);

  const duplicated = useMemo(() => [...cards, ...cards], [cards]);

  return (
    <section
      className="w-full bg-[#f7f6f3] pt-4 pb-10 sm:pb-14 overflow-hidden border-t border-[rgba(55,53,47,0.06)]"
      aria-label="Featured startups carousel"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-6 sm:mb-8 text-center sm:text-left">
        <h2 className="text-xl sm:text-2xl font-semibold text-[#37352f] tracking-tight">
          In the spotlight
        </h2>
      </div>

      <div className="mb-6 sm:mb-8" aria-hidden="true">
        <div className="flex gap-4 sm:gap-6 animate-scroll-right">
          {duplicated.map((c, index) => (
            <StartupCard
              key={`row1-${c.key}-${index}`}
              logo={c.logo}
              name={c.name}
              summary={c.summary}
              visits={c.visits}
              valuation={c.valuation}
              href={c.href}
            />
          ))}
        </div>
      </div>

      <div aria-hidden="true">
        <div className="flex gap-4 sm:gap-6 animate-scroll-left">
          {duplicated.map((c, index) => (
            <StartupCard
              key={`row2-${c.key}-${index}`}
              logo={c.logo}
              name={c.name}
              summary={c.summary}
              visits={c.visits}
              valuation={c.valuation}
              href={c.href}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default CarouselSection;
