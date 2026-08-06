/**
 * Sitemap inclusion rules (Enterprise XML Sitemap Engine).
 * Only indexable, canonical, publicly crawlable URLs may appear.
 */

/** Path prefixes that must never appear in the sitemap. */
export const SITEMAP_EXCLUDED_PREFIXES = [
  "/signin",
  "/signup",
  "/reset-password",
  "/products",
  "/orders",
  "/users",
  "/coupons",
  "/context",
  "/weblog",
  "/themes",
  "/set-style",
  "/setting-seo",
  "/general-setting",
  "/contact",
  "/projects",
  "/checkout/themes", // preview surfaces — noindex
  "/api",
] as const;

/** Exact paths that must never appear in the sitemap. */
export const SITEMAP_EXCLUDED_EXACT = [
  "/", // admin dashboard home
] as const;

export function isSitemapExcludedPath(pathname: string): boolean {
  const path = pathname.replace(/\/$/, "") || "/";

  if ((SITEMAP_EXCLUDED_EXACT as readonly string[]).includes(path)) {
    return true;
  }

  return SITEMAP_EXCLUDED_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );
}

/**
 * Normalize a sitemap candidate URL.
 * Returns null when the URL is invalid or non-canonical for inclusion.
 */
export function normalizeSitemapUrl(raw: string, siteOrigin: string): string | null {
  try {
    const url = new URL(raw, siteOrigin);
    const origin = new URL(siteOrigin);

    if (url.origin !== origin.origin) return null;
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    if (url.search || url.hash) return null;

    url.hostname = url.hostname.toLowerCase();
    const pathname = url.pathname.replace(/\/$/, "") || "/";

    if (isSitemapExcludedPath(pathname)) return null;

    // Prefer https when site origin is https
    if (origin.protocol === "https:") {
      url.protocol = "https:";
    }

    url.pathname = pathname === "/" ? "/" : pathname;
    return url.toString().replace(/\/$/, pathname === "/" ? "/" : "");
  } catch {
    return null;
  }
}
