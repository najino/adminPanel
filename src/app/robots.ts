import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/config/site";

/**
 * robots.txt for the admin panel host.
 *
 * - Disallow crawling of private / auth / admin surfaces
 * - Declare Sitemap only when a canonical SITE_URL is configured
 */
export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        // Admin panel must not be indexed or crawled for content discovery.
        disallow: ["/"],
      },
    ],
    ...(siteUrl
      ? {
          // Points crawlers at this host's sitemap endpoint (may be empty).
          // Storefront public sitemaps should live on the public store domain.
          sitemap: `${siteUrl}/sitemap.xml`,
          host: siteUrl,
        }
      : {}),
  };
}
