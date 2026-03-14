"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";

const ConditionalNavbar = () => {
  const pathname = usePathname();
  
  // Hide navbar on authentication pages
  const hideNavbar = pathname === "/login" || pathname === "/signup" || pathname === "/verify";
  
  if (hideNavbar) return null;
  
  return <Navbar />;
};

export default ConditionalNavbar;
