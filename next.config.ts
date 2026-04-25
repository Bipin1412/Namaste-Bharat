import type { NextConfig } from "next";

const experimentalConfig = {
  cpus: 1,
  webpackBuildWorker: false,
  staticGenerationMaxConcurrency: 1,
  staticGenerationMinPagesPerWorker: 1000,
};

const nextConfig: NextConfig = {
  experimental: experimentalConfig as NextConfig["experimental"],

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "naimwijioakigvjpyanh.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        // Allow any https image source as fallback for user-uploaded URLs
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  // Prevent browsers and Hostinger proxy/CDN from caching HTML pages.
  async headers() {
    return [
      {
        // No caching for HTML pages
        source: "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico)).*)",
        headers: [
          { key: "Cache-Control", value: "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0" },
          { key: "Pragma", value: "no-cache" },
          { key: "Expires", value: "0" },
        ],
      },
      {
        // CSS always revalidated - browser checks for new version every request
        source: "/_next/static/css/:path*",
        headers: [
          { key: "Cache-Control", value: "no-cache, must-revalidate" },
        ],
      },
    ];
  },

  webpack(config, { dev, isServer }) {
    if (!dev && !isServer) {
      const names = (config.plugins ?? []).map((p: unknown) => {
        if (p && typeof p === "object" && "constructor" in p) {
          return (p as { constructor: { name: string } }).constructor.name;
        }
        return "unknown";
      });
      console.log("[WEBPACK PLUGINS]:", names.join(", "));
    }
    return config;
  },
};

export default nextConfig;
