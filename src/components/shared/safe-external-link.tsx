"use client";

import type { ComponentPropsWithoutRef } from "react";
import { EXTERNAL_LINK_REL, isExternalHref } from "@/lib/seo/link-utils";
import { cn } from "@/lib/utils";

type SafeExternalLinkProps = ComponentPropsWithoutRef<"a"> & {
  href: string;
  /** Force new-tab + secure rel even for same-origin absolute URLs */
  forceExternal?: boolean;
};

/**
 * External / new-tab anchors with required SEO + security attributes:
 * target="_blank" rel="nofollow noopener noreferrer"
 */
export function SafeExternalLink({
  href,
  children,
  className,
  forceExternal = false,
  ...props
}: SafeExternalLinkProps) {
  const external = forceExternal || isExternalHref(href);

  if (!external) {
    return (
      <a href={href} className={cn(className)} {...props}>
        {children}
      </a>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel={EXTERNAL_LINK_REL}
      className={cn(className)}
      {...props}
    >
      {children}
    </a>
  );
}
