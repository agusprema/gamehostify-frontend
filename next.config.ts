import type { NextConfig } from "next";
import type { RemotePattern } from "next/dist/shared/lib/image-config";

const baseUrl = process.env.NEXT_PUBLIC_CDN_BASE_URL || "";
let remotePatterns: RemotePattern[] = [];

if (baseUrl) {
  const url = new URL(baseUrl);
  const protocol = url.protocol.replace(":", "") as "http" | "https"; // 👈 force literal type
  remotePatterns.push({
    protocol,
    hostname: url.hostname,
    pathname: "/**",
  });
}

// Tambahkan pexels.com juga
remotePatterns.push({
  protocol: "https",
  hostname: "images.pexels.com",
  pathname: "/**",
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns,
  },
};

export default nextConfig;
