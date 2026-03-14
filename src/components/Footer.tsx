import React from "react";
import Link from "next/link";

const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#f7f6f3] py-12 sm:py-14 md:py-16 px-4 sm:px-6 border-t border-[rgba(55,53,47,0.09)]">
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-semibold text-[#37352f] mb-4 sm:mb-6">
          SANDBOX
        </h2>
        <p className="text-xs sm:text-sm text-[#787774] px-2">
          Copyright claim by{" "}
          <Link
            href="https://www.fluvoSoft.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#37352f] hover:text-[#f97316] underline transition-colors"
          >
            FluvoSoft
          </Link>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
