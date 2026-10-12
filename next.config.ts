import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Allow <Image> to load project screenshots straight from your GitHub repos.
    // Next.js downloads each one once, shrinks it, converts it to a modern format
    // (WebP/AVIF) and caches it, so a 2 MB PNG reaches visitors as a small file.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com",
        pathname: "/keshav301104/**",
      },
    ],
  },
};

export default nextConfig;