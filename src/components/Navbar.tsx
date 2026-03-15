"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(path);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="w-full bg-white/95 backdrop-blur-sm border-b border-[rgba(55,53,47,0.09)] sticky top-0 z-[60]" aria-label="Main navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="font-[var(--font-playfair-display)] font-semibold text-[#37352f] text-lg sm:text-xl hover:opacity-70 transition-opacity"
          aria-label="SANDBOX Home"
          onClick={closeMobileMenu}
        >
          SAND<span className="text-[#f97316]">-BO</span>X
        </Link>

        {/* Desktop Navigation Links - Right Side */}
        <ul className="hidden md:flex items-center gap-1 list-none ml-auto">
          <li>
            <Link
              href="/"
              className={`px-3 py-1.5 rounded-md text-sm font-normal text-[#37352f] hover:bg-[rgba(55,53,47,0.08)] transition-colors ${
                isActive("/")
                  ? "bg-[rgba(249,115,22,0.15)] text-[#37352f]"
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
              className={`px-3 py-1.5 rounded-md text-sm font-normal text-[#37352f] hover:bg-[rgba(55,53,47,0.08)] transition-colors ${
                isActive("/gallery")
                  ? "bg-[rgba(249,115,22,0.15)] text-[#37352f]"
                  : ""
              }`}
              aria-current={isActive("/gallery") ? "page" : undefined}
            >
              Gallery
            </Link>
          </li>
        </ul>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 text-[#37352f] hover:bg-[rgba(55,53,47,0.08)] rounded-md transition-colors"
          onClick={toggleMobileMenu}
          aria-label="Toggle mobile menu"
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? (
            <X size={20} aria-hidden="true" />
          ) : (
            <Menu size={20} aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-[rgba(55,53,47,0.09)] bg-white">
          <ul className="flex flex-col list-none px-4 py-2 gap-1">
            <li>
              <Link
                href="/"
                className={`block px-3 py-2 rounded-md text-sm font-normal text-[#37352f] hover:bg-[rgba(55,53,47,0.08)] transition-colors ${
                  isActive("/")
                    ? "bg-[rgba(249,115,22,0.15)]"
                    : ""
                }`}
                aria-current={isActive("/") ? "page" : undefined}
                onClick={closeMobileMenu}
              >
                Get Feedback
              </Link>
            </li>
            <li>
              <Link
                href="/gallery"
                className={`block px-3 py-2 rounded-md text-sm font-normal text-[#37352f] hover:bg-[rgba(55,53,47,0.08)] transition-colors ${
                  isActive("/gallery")
                    ? "bg-[rgba(249,115,22,0.15)]"
                    : ""
                }`}
                aria-current={isActive("/gallery") ? "page" : undefined}
                onClick={closeMobileMenu}
              >
                Gallery
              </Link>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
