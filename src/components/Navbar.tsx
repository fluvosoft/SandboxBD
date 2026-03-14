import React from "react";
import Link from "next/link";

type NavbarProps = {
  activeLink?: string;
};

const Navbar: React.FC<NavbarProps> = ({ activeLink = "Browse" }) => {
  return (
    <nav className="w-full bg-white">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="font-[var(--font-playfair-display)] font-bold text-slate-800 text-xl"
        >
          SAND<span className="text-orange-500">-BO</span>X
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-8">
          <Link
            href="/browse"
            className={`font-medium text-slate-700 hover:text-slate-900 transition-colors ${
              activeLink === "Browse"
                ? "text-slate-900 underline decoration-slate-900 underline-offset-4"
                : ""
            }`}
          >
            Browse
          </Link>
          <Link
            href="/get-feedback"
            className={`font-medium text-slate-700 hover:text-slate-900 transition-colors ${
              activeLink === "Get Feedback"
                ? "text-slate-900 underline decoration-slate-900 underline-offset-4"
                : ""
            }`}
          >
            Get Feedback
          </Link>
          <Link
            href="/gallery"
            className={`font-medium text-slate-700 hover:text-slate-900 transition-colors ${
              activeLink === "Gallery"
                ? "text-slate-900 underline decoration-slate-900 underline-offset-4"
                : ""
            }`}
          >
            Gallery
          </Link>
        </div>

        {/* CTA Button */}
        <button
          className="bg-slate-900 text-white px-6 py-2 rounded-lg font-medium hover:bg-slate-800 transition-colors cursor-pointer"
        >
          JOIN
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
