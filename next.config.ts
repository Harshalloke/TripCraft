import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // if you later use place photos; keep relaxed here
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;
