"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import VerificationForm from "@/components/auth/VerificationForm";

const VerifyPage = () => {
  return (
    <div className="min-h-screen bg-[#f7f6f3] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="inline-block font-[var(--font-playfair-display)] font-semibold text-[#37352f] text-2xl hover:opacity-70 transition-opacity mb-4"
          >
            SAND<span className="text-[#f97316]">-BO</span>X
          </Link>
        </div>
        <div className="bg-white rounded-md shadow-xl border border-[rgba(55,53,47,0.16)] p-6 sm:p-8">
          <Suspense fallback={
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-[#f97316] border-t-transparent rounded-full animate-spin" />
            </div>
          }>
            <VerificationForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
};

export default VerifyPage;
