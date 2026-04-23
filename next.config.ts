import type { NextConfig } from "next";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const workspaceRoot = dirname(fileURLToPath(import.meta.url));

const experimentalConfig = {
  optimizePackageImports: ["lucide-react"],
  cpus: 1,
  webpackBuildWorker: false,
  staticGenerationMaxConcurrency: 1,
  staticGenerationMinPagesPerWorker: 1000,
};

const nextConfig: NextConfig = {
  experimental: experimentalConfig as NextConfig["experimental"],
  turbopack: {
    root: workspaceRoot,
  },
};

export default nextConfig;
