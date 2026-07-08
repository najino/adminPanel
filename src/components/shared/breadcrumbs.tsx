"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { navigationConfig, type NavItem } from "@/config/navigation";

function flattenNav(
  items: NavItem[],
  result: { href: string; nameKey: string }[] = [],
): { href: string; nameKey: string }[] {
  for (const item of items) {
    if (item.href) result.push({ href: item.href, nameKey: item.nameKey });
    if (item.children) flattenNav(item.children, result);
  }
  return result;
}

const navFlat = flattenNav(navigationConfig);

function getLabelForPath(path: string, t: (key: string) => string): string {
  const exact = navFlat.find((n) => n.href === path);
  if (exact) return t(exact.nameKey);

  const partial = navFlat
    .filter((n) => path.startsWith(n.href) && n.href !== "/")
    .sort((a, b) => b.href.length - a.href.length)[0];
  if (partial) return t(partial.nameKey);

  const segment = path.split("/").filter(Boolean).pop() ?? "";
  return segment.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function Breadcrumbs({ className }: { className?: string }) {
  const pathname = usePathname();
  const t = useTranslations("navigation");

  const cleanPath = pathname.replace(/^\/(en|fa)/, "") || "/";
  if (cleanPath === "/") return null;

  const segments = cleanPath.split("/").filter(Boolean);
  const crumbs = segments.map((_, i) => {
    const href = "/" + segments.slice(0, i + 1).join("/");
    return { href, label: getLabelForPath(href, t) };
  });

  return (
    <nav aria-label="Breadcrumb" className={cn("mb-4 flex items-center gap-1.5 text-sm", className)}>
      <Link
        href="/"
        className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        aria-label="Dashboard"
      >
        <Home className="size-3.5" aria-hidden />
      </Link>
      {crumbs.map((crumb, i) => {
        const isLast = i === crumbs.length - 1;
        return (
          <div key={crumb.href} className="flex items-center gap-1.5">
            <ChevronRight className="size-3.5 text-muted-foreground/50" aria-hidden />
            {isLast ? (
              <span className="font-medium text-foreground" aria-current="page">
                {crumb.label}
              </span>
            ) : (
              <Link
                href={crumb.href}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                {crumb.label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
