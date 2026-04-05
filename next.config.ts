import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["oracledb"],
  experimental: {
    // Limit build workers and memory usage for free tier OCI (1GB RAM)
    cpus: 1,
    workerThreads: false,
    memoryBasedWorkersCount: true,
  },
};

export default nextConfig;
