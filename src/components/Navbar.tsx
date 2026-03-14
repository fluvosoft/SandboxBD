import React from "react";
import Link from "next/link";

type NavbarProps = {
  activeLink?: string;
};

const Navbar: React.FC<NavbarProps> = ({ activeLink = "Browse" }) => {
  return (
    <nav className="w-full bg-white" aria-label="Main navigation">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="font-[var(--font-playfair-display)] font-bold text-slate-800 text-xl"
          aria-label="SANDBOX Home"
        >
          SAND<span className="text-orange-500">-BO</span>X
        </Link>

        {/* Navigation Links */}
        <ul className="flex items-center gap-8 list-none">
          <li>
            <Link
              href="/browse"
              className={`font-medium text-slate-700 hover:text-slate-900 transition-colors ${
                activeLink === "Browse"
                  ? "text-slate-900 underline decoration-slate-900 underline-offset-4"
                  : ""
              }`}
              aria-current={activeLink === "Browse" ? "page" : undefined}
            >
              Browse
            </Link>
          </li>
          <li>
            <Link
              href="/get-feedback"
              className={`font-medium text-slate-700 hover:text-slate-900 transition-colors ${
                activeLink === "Get Feedback"
                  ? "text-slate-900 underline decoration-slate-900 underline-offset-4"
                  : ""
              }`}
              aria-current={activeLink === "Get Feedback" ? "page" : undefined}
            >
              Get Feedback
            </Link>
          </li>
          <li>
            <Link
              href="/gallery"
              className={`font-medium text-slate-700 hover:text-slate-900 transition-colors ${
                activeLink === "Gallery"
                  ? "text-slate-900 underline decoration-slate-900 underline-offset-4"
                  : ""
              }`}
              aria-current={activeLink === "Gallery" ? "page" : undefined}
            >
              Gallery
            </Link>
          </li>
        </ul>

        {/* CTA Button */}
        <button
          className="bg-slate-900 text-white px-6 py-2 rounded-lg font-medium hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="Join SANDBOX"
        >
          JOIN
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
