import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/config/site";
import { normalizeSitemapUrl } from "@/lib/seo/sitemap-rules";

/**
 * Dynamic sitemap for this application.
 *
 * This codebase is an authenticated admin panel. Per Google / enterprise
 * sitemap rules, admin, auth, private, preview, and noindex URLs must not
 * appear in the sitemap.
 *
 * When public indexable storefront URLs are published through this app in
 * the future, add only validated canonical HTTPS URLs with real lastmod
 * timestamps (content updated_at) — never invent changefreq/priority.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  if (!siteUrl) {
    // Never emit placeholder domains (e.g. example.com).
    return [];
  }

  // Intentionally empty: no public indexable routes in the admin panel.
  // Keep the pipeline ready for future public URLs via normalizeSitemapUrl.
  const candidates: Array<{ path: string; lastModified?: Date }> = [];

  const entries: MetadataRoute.Sitemap = [];
  const seen = new Set<string>();

  for (const candidate of candidates) {
    const absolute = normalizeSitemapUrl(candidate.path, siteUrl);
    if (!absolute || seen.has(absolute)) continue;
    seen.add(absolute);

    entries.push({
      url: absolute,
      // Only include lastModified when we have a real content timestamp.
      ...(candidate.lastModified ? { lastModified: candidate.lastModified } : {}),
    });
  }

  return entries;
}
