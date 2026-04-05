import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["mysql2"],
  experimental: {
    // Limit build workers and memory usage for free tier OCI (1GB RAM)
    cpus: 1,
    workerThreads: false,
    memoryBasedWorkersCount: true,
  },
};

export default nextConfig;
