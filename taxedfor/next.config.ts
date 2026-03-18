import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pdf2pic is an optional runtime dependency for PDF support.
  // No special config needed — it's require()'d dynamically in the API route.
  turbopack: {},
};

export default nextConfig;
