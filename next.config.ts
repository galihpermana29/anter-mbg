import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  // ignore eslint
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
