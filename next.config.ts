import type { NextConfig } from "next";
import type { RemotePattern } from "next/dist/shared/lib/image-config";

const baseUrl = process.env.NEXT_PUBLIC_CDN_BASE_URL || "";
const backendPublicBase = process.env.NEXT_PUBLIC_BACKEND_API_BASE_URL || "";
const backendPrivateBase = process.env.BACKEND_API_BASE_URL || ""; // only hostname used
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

// Izinkan domain backend publik untuk logo/payment assets
if (backendPublicBase) {
  try {
    const u = new URL(backendPublicBase);
    const protocol = u.protocol.replace(":", "") as "http" | "https";
    remotePatterns.push({ protocol, hostname: u.hostname, pathname: "/**" });
  } catch {}
}

if (backendPrivateBase) {
  try {
    const u = new URL(backendPrivateBase);
    const protocol = u.protocol.replace(":", "") as "http" | "https";
    remotePatterns.push({ protocol, hostname: u.hostname, pathname: "/**" });
  } catch {}
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns,
  },
};

export default nextConfig;
