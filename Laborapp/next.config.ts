import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingRoot: __dirname,
  experimental: {
    outputFileTracingRoot: __dirname,
  },
};

export default nextConfig;
