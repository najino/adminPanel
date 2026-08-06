"use client";

import { cn } from "@/lib/utils";

/**
 * Lightweight page enter animation (CSS-only).
 * Avoids shipping framer-motion on every dashboard route (INP / TBT).
 */
export function PageTransition({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("animate-fade-up", className)}>{children}</div>;
}
