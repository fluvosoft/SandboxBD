"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Navbar: React.FC = () => {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(path);
  };

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
              href="/"
              className={`font-medium text-slate-700 hover:text-slate-900 transition-colors ${
                isActive("/")
                  ? "text-slate-900 underline decoration-slate-900 underline-offset-4"
                  : ""
              }`}
              aria-current={isActive("/") ? "page" : undefined}
            >
              Get Feedback
            </Link>
          </li>
          <li>
            <Link
              href="/gallery"
              className={`font-medium text-slate-700 hover:text-slate-900 transition-colors ${
                isActive("/gallery")
                  ? "text-slate-900 underline decoration-slate-900 underline-offset-4"
                  : ""
              }`}
              aria-current={isActive("/gallery") ? "page" : undefined}
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
