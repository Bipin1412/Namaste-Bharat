import type { NextConfig } from "next";

const experimentalConfig = {
  optimizePackageImports: ["lucide-react"],
  cpus: 1,
  webpackBuildWorker: false,
  staticGenerationMaxConcurrency: 1,
  staticGenerationMinPagesPerWorker: 1000,
};

const nextConfig: NextConfig = {
  experimental: experimentalConfig as NextConfig["experimental"],

  // Prevent browsers and Hostinger's proxy from caching HTML pages.
  // This ensures users always get the latest HTML with correct chunk hashes
  // after a new deployment. Static assets (_next/static) remain cacheable.
  async headers() {
    return [
      {
        // Match all pages but NOT static assets, images, or API routes
        source: "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico)).*)",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0",
          },
          {
            key: "Pragma",
            value: "no-cache",
          },
          {
            key: "Expires",
            value: "0",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
