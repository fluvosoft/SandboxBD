"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Modal from "@/components/ui/Modal";

/** Bump suffix when you want the announcement to show again for all visitors. */
const STORAGE_KEY = "sandbox-dismissed-sand-score-announcement-v1";

export default function SandScoreAnnouncementModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      if (window.localStorage.getItem(STORAGE_KEY) === "1") return;
      setOpen(true);
    } catch {
      setOpen(true);
    }
  }, []);

  const handleClose = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
    setOpen(false);
  };

  return (
    <Modal
      isOpen={open}
      onClose={handleClose}
      title="New update: Sand Score"
    >
      <div className="space-y-4">
        <p className="text-sm sm:text-base text-[#37352f] leading-relaxed">
          Every review now includes a{" "}
          <span className="font-semibold text-[#f97316]">Sand Score</span>
          —a single 0–100 readout built from our weighted pillars. You&apos;ll
          see it on feedback pages, the home carousel, and the startup gallery.
        </p>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-1">
          <button
            type="button"
            onClick={handleClose}
            className="w-full sm:flex-1 rounded-md bg-[#f97316] hover:bg-[#ea580c] text-white text-sm font-medium py-2.5 px-4 transition-colors"
          >
            Got it
          </button>
          <Link
            href="/gallery"
            onClick={handleClose}
            className="w-full sm:flex-1 text-center rounded-md border border-[rgba(55,53,47,0.16)] hover:bg-[rgba(55,53,47,0.06)] text-[#37352f] text-sm font-medium py-2.5 px-4 transition-colors"
          >
            View gallery
          </Link>
        </div>
      </div>
    </Modal>
  );
}
