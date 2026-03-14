"use client";

import { usePathname } from "next/navigation";
import AnnouncementBar from "./AnnouncementBar";

const ConditionalAnnouncementBar = () => {
  const pathname = usePathname();
  
  // Hide announcement bar on authentication pages
  const hideAnnouncement = pathname === "/login" || pathname === "/signup" || pathname === "/verify";
  
  if (hideAnnouncement) return null;
  
  return <AnnouncementBar message="✨ Get honest feedback about your startup - Paste your URL now! ✨" />;
};

export default ConditionalAnnouncementBar;
