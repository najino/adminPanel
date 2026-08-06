import type { Metadata } from "next";
import { getSiteUrl } from "@/config/site";

/** Admin panel is private — never allow indexing. */
export const ADMIN_ROBOTS: NonNullable<Metadata["robots"]> = {
  index: false,
  follow: false,
  nocache: true,
  googleBot: {
    index: false,
    follow: false,
    noimageindex: true,
    nosnippet: true,
  },
};

/**
 * Shared admin metadata defaults (Metadata.md + private-app policy).
 * Indexable public storefront metadata is configured via SEO settings CMS.
 */
export function buildAdminMetadata(options?: {
  title?: string;
  description?: string;
  titleTemplate?: string;
}): Metadata {
  const siteUrl = getSiteUrl();
  const defaultTitle = "Store Admin Panel";

  return {
    ...(siteUrl ? { metadataBase: new URL(siteUrl) } : {}),
    title: options?.title
      ? options.title
      : {
          default: defaultTitle,
          template: options?.titleTemplate ?? `%s | ${defaultTitle}`,
        },
    description: options?.description,
    robots: ADMIN_ROBOTS,
  };
}

const BLOCKED_HOST_FRAGMENTS = ["example.com", "example.org", "localhost"];

/** Reject placeholder / non-production hosts for storefront SEO fields. */
export function isPlaceholderSeoUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  try {
    const url = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
    const host = url.hostname.toLowerCase();
    return BLOCKED_HOST_FRAGMENTS.some(
      (frag) => host === frag || host.endsWith(`.${frag}`),
    );
  } catch {
    return true;
  }
}

export function isValidHttpUrl(value: string): boolean {
  if (!value.trim()) return true;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}
