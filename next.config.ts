 // next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // 🟢 BINAGO: Kailangan ito para basahin ng Next.js 16 ang forbidden() at unauthorized()
    authInterrupts: true,
  },
};

export default nextConfig;
