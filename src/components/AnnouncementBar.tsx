import React from "react";

type AnnouncementBarProps = {
  message: string;
};

const AnnouncementBar: React.FC<AnnouncementBarProps> = ({ message }) => {
  return (
    <div className="relative w-full border-b border-slate-600/40 bg-linear-to-r from-slate-900 via-slate-950 to-slate-900 text-sm text-slate-100 flex items-center justify-center overflow-hidden py-3.5 px-6">
      {/* soft glow background */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(191,219,254,0.2),transparent_60%)]" />

      {/* animated pastel blue sweep across full width */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-announcement-flash h-full w-full bg-[linear-gradient(90deg,rgba(191,219,254,0)_0%,rgba(191,219,254,0.8)_40%,rgba(191,219,254,0.8)_60%,rgba(191,219,254,0)_100%)] mix-blend-screen" />
      </div>

      <p className="relative z-10 whitespace-nowrap text-center">{message}</p>
    </div>
  );
};

export default AnnouncementBar;

