"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { ChevronDown, Moon, Search, Store, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { navigationGroups, type NavItem } from "@/config/navigation";
import { getNavIcon } from "@/config/navigation-icons";
import { useEffect, useMemo, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface SidebarProps {
  collapsed: boolean;
  onNavigate?: () => void;
}

function NavIcon({
  nameKey,
  active,
}: {
  nameKey: string;
  active?: boolean;
}) {
  const Icon = getNavIcon(nameKey);

  return (
    <Icon
      className={cn(
        "size-5 shrink-0 transition-colors",
        active
          ? "text-primary-foreground"
          : "text-muted-foreground group-hover:text-foreground",
      )}
      strokeWidth={1.75}
      aria-hidden
    />
  );
}

function NavLink({
  item,
  collapsed,
  onNavigate,
  depth = 0,
  tipSide,
  query,
}: {
  item: NavItem;
  collapsed: boolean;
  onNavigate?: () => void;
  depth?: number;
  tipSide: "left" | "right";
  query: string;
}) {
  const t = useTranslations("navigation");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const label = t(item.nameKey);
  const nested = depth > 0;
  const q = query.trim().toLowerCase();

  const matchesQuery = (navItem: NavItem): boolean => {
    if (!q) return true;
    const self = t(navItem.nameKey).toLowerCase().includes(q);
    if (self) return true;
    return navItem.children?.some(matchesQuery) ?? false;
  };

  if (item.children) {
    if (q && !matchesQuery(item)) return null;

    if (collapsed) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              className="group flex w-full items-center justify-center rounded-xl p-3 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              aria-label={label}
            >
              <NavIcon nameKey={item.nameKey} />
            </button>
          </TooltipTrigger>
          <TooltipContent side={tipSide} className="flex flex-col gap-1 p-2">
            {item.children.map((child) => (
              <Link
                key={child.nameKey}
                href={child.href!}
                onClick={onNavigate}
                className="rounded-lg px-2 py-1.5 text-sm hover:bg-accent"
              >
                {t(child.nameKey)}
              </Link>
            ))}
          </TooltipContent>
        </Tooltip>
      );
    }

    const expanded = q ? true : open;

    return (
      <div className="flex flex-col gap-1">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-expanded={expanded}
          className="group flex w-full items-center justify-between rounded-xl p-3 transition-all duration-150 hover:bg-accent motion-reduce:transition-none"
        >
          <span className="flex min-w-0 items-center gap-3">
            <NavIcon nameKey={item.nameKey} />
            <span className="truncate text-sm font-medium text-muted-foreground transition-colors group-hover:text-foreground">
              {label}
            </span>
          </span>
          <ChevronDown
            className={cn(
              "size-4 shrink-0 text-muted-foreground/60 transition-transform duration-200",
              expanded && "rotate-180",
            )}
            strokeWidth={2}
            aria-hidden
          />
        </button>
        <div
          className={cn(
            "grid transition-[grid-template-rows,opacity] duration-300 ease-out",
            expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
          )}
        >
          <div className="min-h-0 overflow-hidden">
            <div className="ms-4 flex flex-col gap-1 border-s border-border ps-3">
              {item.children.map((child) => (
                <NavLink
                  key={child.nameKey}
                  item={child}
                  collapsed={collapsed}
                  onNavigate={onNavigate}
                  depth={depth + 1}
                  tipSide={tipSide}
                  query={query}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (q && !matchesQuery(item)) return null;

  const pathWithoutLocale = pathname.replace(/^\/(fa|en)/, "") || "/";
  const active =
    item.href === "/"
      ? pathWithoutLocale === "/"
      : pathWithoutLocale === item.href || pathWithoutLocale.startsWith(`${item.href}/`);

  const linkContent = (
    <Link
      href={item.href!}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group flex items-center gap-3 rounded-xl p-3 text-sm font-medium transition-all duration-150 motion-reduce:transition-none",
        active
          ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25"
          : "text-muted-foreground hover:bg-accent hover:text-foreground",
        collapsed && "justify-center",
        nested && "py-2.5",
      )}
    >
      <NavIcon nameKey={item.nameKey} active={active} />
      {!collapsed && <span className="truncate">{label}</span>}
    </Link>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
        <TooltipContent side={tipSide}>{label}</TooltipContent>
      </Tooltip>
    );
  }

  return linkContent;
}

export function Sidebar({ collapsed, onNavigate }: SidebarProps) {
  const t = useTranslations("navigation");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const tipSide = locale === "fa" ? "left" : "right";
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  const visibleGroups = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return navigationGroups;

    return navigationGroups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => {
          const self = t(item.nameKey).toLowerCase().includes(q);
          if (self) return true;
          return item.children?.some((child) =>
            t(child.nameKey).toLowerCase().includes(q),
          );
        }),
      }))
      .filter((group) => group.items.length > 0);
  }, [query, t]);

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-sidebar text-sidebar-foreground shadow-elevated-md transition-[width] duration-300 motion-reduce:transition-none dark:border-white/5 dark:shadow-2xl",
          collapsed ? "w-[84px] p-3" : "w-72 p-6",
        )}
      >
        {!collapsed ? (
          <div className="mb-6 shrink-0">
            <div className="relative">
              <Search
                className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-primary"
                aria-hidden
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`${tCommon("search")}...`}
                className="w-full rounded-xl border border-input bg-background py-2.5 ps-10 pe-3 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:ring-1 focus:ring-primary dark:border-white/10 dark:bg-white/5"
                aria-label={tCommon("search")}
              />
            </div>
          </div>
        ) : (
          <button
            type="button"
            className="mb-4 flex size-10 items-center justify-center self-center rounded-xl border border-border text-primary transition-colors hover:bg-accent"
            aria-label={tCommon("search")}
          >
            <Search className="size-4" strokeWidth={1.75} />
          </button>
        )}

        <div
          className={cn(
            "mb-6 flex shrink-0 items-center",
            collapsed ? "justify-center" : "justify-between px-1",
          )}
        >
          <Link
            href="/"
            className={cn(
              "flex min-w-0 items-center gap-3 transition-opacity hover:opacity-90",
              collapsed && "justify-center",
            )}
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/15">
              <Store className="size-5 text-primary" strokeWidth={1.75} aria-hidden />
            </div>
            {!collapsed && (
              <span className="truncate text-lg font-bold leading-tight text-foreground">
                {tCommon("appName")}
              </span>
            )}
          </Link>
          {!collapsed && (
            <ChevronDown
              className="size-4 shrink-0 text-muted-foreground"
              strokeWidth={2}
              aria-hidden
            />
          )}
        </div>

        <nav
          className="scrollbar-premium flex flex-1 flex-col gap-1 overflow-y-auto overscroll-contain"
          aria-label={tCommon("a11y.mainNavigation")}
        >
          {visibleGroups.map((group, gi) => (
            <div key={group.labelKey ?? `g-${gi}`} className="flex flex-col gap-1">
              {group.items.map((item) => (
                <NavLink
                  key={item.nameKey}
                  item={item}
                  collapsed={collapsed}
                  onNavigate={onNavigate}
                  tipSide={tipSide}
                  query={query}
                />
              ))}
            </div>
          ))}
        </nav>

        <div className={cn("mt-auto shrink-0 border-t border-border pt-6", collapsed && "pt-4")}>
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="mx-auto flex size-10 items-center justify-center rounded-xl border border-border bg-muted text-primary transition-colors hover:bg-accent"
                  onClick={() => setTheme(isDark ? "light" : "dark")}
                  aria-label={tCommon("darkMode")}
                >
                  {isDark ? (
                    <Sun className="size-5" strokeWidth={1.75} />
                  ) : (
                    <Moon className="size-5" strokeWidth={1.75} />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side={tipSide}>{tCommon("darkMode")}</TooltipContent>
            </Tooltip>
          ) : (
            <div className="flex items-center justify-between rounded-2xl border border-border bg-muted/70 px-3 py-3 dark:bg-white/5">
              <div className="flex items-center gap-3">
                {isDark ? (
                  <Moon className="size-5 text-primary" strokeWidth={1.75} aria-hidden />
                ) : (
                  <Sun className="size-5 text-amber-500" strokeWidth={1.75} aria-hidden />
                )}
                <Label
                  htmlFor="sidebar-dark-mode"
                  className="cursor-pointer text-sm font-medium text-foreground"
                >
                  {tCommon("darkMode")}
                </Label>
              </div>
              <Switch
                id="sidebar-dark-mode"
                checked={isDark}
                disabled={!mounted}
                onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                aria-label={tCommon("darkMode")}
                className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-input"
              />
            </div>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
}
