"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

type AppImageProps = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  /** Eager-load LCP / above-the-fold images only */
  priority?: boolean;
  fill?: boolean;
  sizes?: string;
};

function isOptimizableSrc(src: string): boolean {
  if (!src || src.startsWith("data:") || src.startsWith("blob:")) return false;
  if (src.startsWith("/")) return true;

  try {
    const { hostname, protocol } = new URL(src);
    if (protocol !== "http:" && protocol !== "https:") return false;
    return (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "images.unsplash.com" ||
      hostname === "lh3.googleusercontent.com" ||
      hostname.endsWith(".paryabtools.ir") ||
      hostname === "paryabtools.ir"
    );
  } catch {
    return false;
  }
}

/**
 * Performance-safe image: explicit dimensions (CLS), lazy by default (LCP),
 * next/image optimization when the host is allowlisted.
 */
export function AppImage({
  src,
  alt,
  width = 40,
  height = 40,
  className,
  priority = false,
  fill = false,
  sizes,
}: AppImageProps) {
  if (!src) return null;

  const optimize = isOptimizableSrc(src);
  const common = {
    src,
    alt,
    className: cn(className),
    priority,
    loading: priority ? ("eager" as const) : ("lazy" as const),
    decoding: "async" as const,
    unoptimized: !optimize,
  };

  if (fill) {
    return <Image {...common} fill sizes={sizes ?? "100vw"} />;
  }

  return <Image {...common} width={width} height={height} sizes={sizes} />;
}
