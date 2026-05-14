import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",          // Generates static HTML/CSS/JS in the /out folder
  trailingSlash: true,       // Required for Hostinger shared hosting
  images: {
    unoptimized: true,       // Required for static export (no Next.js image server)
    formats: ["image/webp", "image/avif"],
    deviceSizes: [640, 768, 1024, 1280, 1920],
  },
};

export default nextConfig;
