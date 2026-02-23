import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@courierflow/contracts", "@courierflow/ui"],
};

export default nextConfig;
