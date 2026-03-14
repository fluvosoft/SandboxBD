"use client";

import React from "react";
import Link from "next/link";
import SignupForm from "@/components/auth/SignupForm";

const SignupPage = () => {
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
          <SignupForm onSwitchToLogin={() => {}} />
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
