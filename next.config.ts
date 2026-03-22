import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  async redirects() {
    return [
      {
        source: "/favicon.ico",
        destination: "/sandbox-bd-startup-feedback-icon.png",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
