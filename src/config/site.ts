/**
 * Canonical site URL helpers for sitemap / robots / metadata.
 * Prefer NEXT_PUBLIC_SITE_URL; never invent a public domain.
 */
export function getSiteUrl(): string | null {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) return null;

  try {
    const url = new URL(raw.startsWith("http") ? raw : `https://${raw}`);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    // Normalize: no trailing slash, lowercase host
    url.hostname = url.hostname.toLowerCase();
    url.hash = "";
    url.search = "";
    const normalized = url.origin + (url.pathname === "/" ? "" : url.pathname.replace(/\/$/, ""));
    return normalized;
  } catch {
    return null;
  }
}

export function absoluteUrl(path: string): string | null {
  const base = getSiteUrl();
  if (!base) return null;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}
