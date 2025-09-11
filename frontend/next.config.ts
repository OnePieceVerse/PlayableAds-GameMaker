import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "banner2.cleanpng.com",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
      // Allow images served by backend in production
      {
        protocol: "http",
        hostname: "9.134.162.182",
        port: "8000",
      },
    ],
  },
};

export default nextConfig;
