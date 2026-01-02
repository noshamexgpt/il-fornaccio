import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ["localhost:3000", "192.168.1.128:3000", "192.168.1.128"],
};

export default nextConfig;
