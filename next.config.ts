import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  // ignore eslint
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.cloudinary.com",
      },
    ],
  },
};

export default nextConfig;
