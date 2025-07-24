import type { NextConfig } from "next";

const baseUrl = process.env.NEXT_PUBLIC_CDN_BASE_URL || '';
const hostname = baseUrl ? new URL(baseUrl).hostname : '';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: hostname ? [hostname, 'images.pexels.com'] : [],
  },
};

export default nextConfig;