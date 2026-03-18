import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      // pdf2pic is optional — don't error if missing
      config.externals = [
        ...(Array.isArray(config.externals) ? config.externals : []),
        ({ request }: { request: string }, callback: (err?: Error | null, result?: string) => void) => {
          if (request === "pdf2pic") {
            return callback(undefined, "commonjs pdf2pic");
          }
          callback();
        },
      ];
    }
    return config;
  },
};

export default nextConfig;
