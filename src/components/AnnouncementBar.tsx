import React from "react";

type AnnouncementBarProps = {
  message: string;
};

const AnnouncementBar: React.FC<AnnouncementBarProps> = ({ message }) => {
  return (
    <div className="relative w-full border-b border-[rgba(55,53,47,0.09)] bg-[#f7f6f3] text-xs sm:text-sm text-[#787774] flex items-center justify-center overflow-hidden py-2.5 sm:py-3 px-3 sm:px-6">
      <p className="relative z-10 text-center px-2 break-words">{message}</p>
    </div>
  );
};

export default AnnouncementBar;

