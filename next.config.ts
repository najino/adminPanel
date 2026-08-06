import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import path from "path";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

function apiHostPatterns() {
  const patterns: NonNullable<NextConfig["images"]>["remotePatterns"] = [
    { protocol: "https", hostname: "images.unsplash.com" },
    { protocol: "https", hostname: "**.paryabtools.ir" },
    { protocol: "https", hostname: "lh3.googleusercontent.com" },
    { protocol: "http", hostname: "localhost" },
    { protocol: "http", hostname: "127.0.0.1" },
  ];

  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (apiBase) {
    try {
      const { protocol, hostname } = new URL(apiBase);
      if (hostname && (protocol === "http:" || protocol === "https:")) {
        patterns.push({
          protocol: protocol.replace(":", "") as "http" | "https",
          hostname,
        });
      }
    } catch {
      // ignore invalid API URL
    }
  }

  return patterns;
}

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: path.join(__dirname),
  poweredByHeader: false,
  compress: true,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: apiHostPatterns(),
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts", "date-fns", "framer-motion"],
  },
  async headers() {
    return [
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/:path*.(woff2|woff|ttf|otf|ico|svg|png|jpg|jpeg|webp|avif)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
