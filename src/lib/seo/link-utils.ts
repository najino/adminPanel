/** Shared link SEO helpers (Link.md). */

export const EXTERNAL_LINK_REL = "nofollow noopener noreferrer" as const;

export function isAbsoluteHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function isMailtoUrl(value: string): boolean {
  return /^mailto:[^\s@]+@[^\s@]+\.[^\s@]+$/i.test(value.trim());
}

export function isTelUrl(value: string): boolean {
  return /^tel:\+?[\d\s()-]{5,}$/i.test(value.trim());
}

/** True when the href leaves the current site origin (or is absolute http(s) in SSR). */
export function isExternalHref(href: string, siteOrigin?: string | null): boolean {
  if (!href) return false;
  if (href.startsWith("/") || href.startsWith("#") || href.startsWith("?")) return false;
  if (href.startsWith("mailto:") || href.startsWith("tel:")) return true;
  if (!isAbsoluteHttpUrl(href)) return false;
  if (!siteOrigin) return true;
  try {
    return new URL(href).origin !== new URL(siteOrigin).origin;
  } catch {
    return true;
  }
}
