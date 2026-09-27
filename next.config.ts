 // next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* 🎨 IDINAGDAG NATIN ITO: Pinapahintulutan si Cloudinary na mag-load ng larawan sa unahan */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },

  experimental: {
    authInterrupts: false,
  },
};

export default nextConfig;
