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
        active ? "text-indigo-400" : "text-slate-400 group-hover:text-indigo-300",
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
              className="group flex w-full items-center justify-center rounded-xl p-3 text-slate-300 transition-colors hover:bg-white/5"
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
          className="group flex w-full items-center justify-between rounded-xl p-3 transition-all duration-150 hover:bg-white/5 motion-reduce:transition-none"
        >
          <span className="flex min-w-0 items-center gap-3">
            <NavIcon nameKey={item.nameKey} />
            <span className="truncate text-sm font-medium text-slate-300 transition-colors group-hover:text-white">
              {label}
            </span>
          </span>
          <ChevronDown
            className={cn(
              "size-4 shrink-0 text-slate-600 transition-transform duration-200",
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
            <div className="ms-4 flex flex-col gap-1 border-s border-white/10 ps-3">
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
          ? "bg-white/10 text-white"
          : "text-slate-300 hover:bg-white/5 hover:text-white",
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
          "flex h-full flex-col overflow-hidden rounded-3xl border border-white/5 bg-[#0f172a] text-slate-200 shadow-2xl transition-[width] duration-300 motion-reduce:transition-none",
          collapsed ? "w-[84px] p-3" : "w-72 p-6",
        )}
      >
        {!collapsed ? (
          <div className="mb-6 shrink-0">
            <div className="relative">
              <Search
                className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-indigo-400"
                aria-hidden
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`${tCommon("search")}...`}
                className="w-full rounded-xl border border-slate-800 bg-slate-900/80 py-2.5 ps-10 pe-3 text-sm text-slate-200 outline-none transition-all placeholder:text-slate-500 focus:bg-slate-900 focus:ring-1 focus:ring-indigo-500"
                aria-label={tCommon("search")}
              />
            </div>
          </div>
        ) : (
          <button
            type="button"
            className="mb-4 flex size-10 items-center justify-center self-center rounded-xl border border-slate-800 text-indigo-400 transition-colors hover:bg-white/5"
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
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-indigo-500/20">
              <Store className="size-5 text-indigo-400" strokeWidth={1.75} aria-hidden />
            </div>
            {!collapsed && (
              <span className="truncate text-lg font-bold leading-tight text-white">
                {tCommon("appName")}
              </span>
            )}
          </Link>
          {!collapsed && (
            <ChevronDown className="size-4 shrink-0 text-slate-500" strokeWidth={2} aria-hidden />
          )}
        </div>

        <nav
          className="scrollbar-premium flex flex-1 flex-col gap-1 overflow-y-auto overscroll-contain"
          aria-label="Main"
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

        <div className={cn("mt-auto shrink-0 border-t border-slate-800 pt-6", collapsed && "pt-4")}>
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="mx-auto flex size-10 items-center justify-center rounded-xl border border-slate-800/50 bg-slate-900/60 text-indigo-400 transition-colors hover:bg-white/5"
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
            <div className="flex items-center justify-between rounded-2xl border border-slate-800/50 bg-slate-900/60 px-3 py-3">
              <div className="flex items-center gap-3">
                {isDark ? (
                  <Moon className="size-5 text-indigo-400" strokeWidth={1.75} aria-hidden />
                ) : (
                  <Sun className="size-5 text-slate-400" strokeWidth={1.75} aria-hidden />
                )}
                <Label
                  htmlFor="sidebar-dark-mode"
                  className="cursor-pointer text-sm font-medium text-slate-200"
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
                className="data-[state=checked]:bg-indigo-600 data-[state=unchecked]:bg-slate-700"
              />
            </div>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
}
