import React from "react";
import Link from "next/link";

const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-white py-16 px-6">
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-6xl md:text-8xl font-bold bg-linear-to-r from-slate-900 to-blue-900 bg-clip-text text-transparent mb-6">
          SANDBOX
        </h2>
        <p className="text-sm text-slate-600">
          Copyright claim by{" "}
          <Link
            href="https://www.fluvoSoft.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-900 hover:text-slate-700 underline transition-colors"
          >
            FluvoSoft
          </Link>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
