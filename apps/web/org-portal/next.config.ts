import type { NextConfig } from "next";

const localNetworkOrigin = process.env.NEXT_PUBLIC_LOCAL_NETWORK_ORIGIN?.trim() || "";
const liveKitProxyTarget = process.env.LIVEKIT_PROXY_TARGET?.trim() || "http://127.0.0.1:7880";
function hostnameFromOrigin(origin: string): string {
  if (!origin) return "";
  try {
    return new URL(origin).hostname;
  } catch {
    return origin.replace(/^https?:\/\//, "").replace(/[:\/].*$/, "").trim();
  }
}
const localNetworkHost = hostnameFromOrigin(localNetworkOrigin);
const extraAllowedDevOrigins = (process.env.NEXT_DEV_ALLOWED_ORIGINS || "")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);
const allowedDevOrigins = Array.from(new Set([
  "*.ngrok-free.dev",
  "*.ngrok.io",
  "localhost",
  "127.0.0.1",
  localNetworkHost,
  ...extraAllowedDevOrigins,
].filter(Boolean)));

const nextConfig: NextConfig = {
  allowedDevOrigins,
  async rewrites() {
    return [
      {
        source: "/livekit",
        destination: `${liveKitProxyTarget}`,
      },
      {
        source: "/livekit/:path*",
        destination: `${liveKitProxyTarget}/:path*`,
      },
    ];
  },
  experimental: {
    externalDir: true,
  },
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
