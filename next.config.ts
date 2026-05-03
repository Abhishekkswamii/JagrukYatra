import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1", "localhost"],

  // Produce a standalone build for Docker / Cloud Run
  output: "standalone",

  // Optimisations
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" }, // Google profile photos
    ],
  },

  // Compress assets
  compress: true,

  // Strict mode for better React practices
  reactStrictMode: true,

  // Disable Dev Branding (Black N logo, Turbopack, Build indicator)
  devIndicators: {
    appIsrStatus: false,
    buildActivity: false,
  } as any,
};

export default nextConfig;
