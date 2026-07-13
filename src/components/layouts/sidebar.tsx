"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { ChevronDown, Moon, Store, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { navigationGroups, type NavItem } from "@/config/navigation";
import { getNavIcon } from "@/config/navigation-icons";
import { useEffect, useState } from "react";
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
  nested,
}: {
  nameKey: string;
  active?: boolean;
  nested?: boolean;
}) {
  const Icon = getNavIcon(nameKey);

  if (nested) {
    return (
      <Icon
        className={cn(
          "size-3.5 shrink-0 transition-colors",
          active ? "text-primary" : "text-muted-foreground/70",
        )}
        strokeWidth={1.5}
        aria-hidden
      />
    );
  }

  return (
    <span
      className={cn(
        "flex size-7 shrink-0 items-center justify-center rounded-lg transition-colors duration-150",
        active
          ? "bg-primary/15 text-primary"
          : "bg-muted/70 text-muted-foreground group-hover:bg-muted group-hover:text-foreground",
      )}
    >
      <Icon className="size-3.5" strokeWidth={1.5} aria-hidden />
    </span>
  );
}

function NavLink({
  item,
  collapsed,
  onNavigate,
  depth = 0,
  tipSide,
}: {
  item: NavItem;
  collapsed: boolean;
  onNavigate?: () => void;
  depth?: number;
  tipSide: "left" | "right";
}) {
  const t = useTranslations("navigation");
  const pathname = usePathname();
  const [open, setOpen] = useState(true);
  const label = t(item.nameKey);
  const nested = depth > 0;

  if (item.children) {
    if (collapsed) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              className="group flex w-full items-center justify-center rounded-xl px-2 py-2 text-sidebar-foreground transition-colors hover:bg-sidebar-accent"
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

    return (
      <div className="flex flex-col gap-0.5">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          className="group flex w-full items-center gap-2.5 rounded-xl px-2 py-1.5 text-[13px] font-medium text-muted-foreground transition-colors duration-150 hover:bg-black/[0.04] hover:text-foreground dark:hover:bg-white/[0.06] motion-reduce:transition-none"
        >
          <NavIcon nameKey={item.nameKey} />
          <span className="flex-1 text-start tracking-wide">{label}</span>
          <ChevronDown
            className={cn(
              "size-3.5 shrink-0 opacity-40 transition-transform duration-200",
              !open && "-rotate-90",
            )}
            strokeWidth={1.5}
            aria-hidden
          />
        </button>
        <div
          className={cn(
            "grid transition-[grid-template-rows,opacity] duration-300 ease-out",
            open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
          )}
        >
          <div className="min-h-0 overflow-hidden">
            <div className="relative ms-5 mt-0.5 flex flex-col gap-0.5 border-s border-border/60 ps-3">
              {item.children.map((child) => (
                <NavLink
                  key={child.nameKey}
                  item={child}
                  collapsed={collapsed}
                  onNavigate={onNavigate}
                  depth={depth + 1}
                  tipSide={tipSide}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

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
        "group relative flex items-center gap-2.5 rounded-xl px-2 py-1.5 text-[13px] font-medium tracking-wide transition-all duration-150 motion-reduce:transition-none",
        active
          ? "bg-primary/10 text-foreground"
          : "text-muted-foreground hover:bg-black/[0.04] hover:text-foreground dark:hover:bg-white/[0.06]",
        collapsed && "justify-center px-2 py-2",
        nested && "py-1.5",
      )}
    >
      {active && !collapsed && (
        <span
          className="absolute inset-y-1.5 start-0 w-[3px] rounded-full bg-primary"
          aria-hidden
        />
      )}
      <NavIcon nameKey={item.nameKey} active={active} nested={nested} />
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

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "flex h-full flex-col overflow-hidden rounded-2xl border border-sidebar-border/80 bg-sidebar text-sidebar-foreground shadow-elevated-md transition-[width] duration-300 motion-reduce:transition-none",
          collapsed ? "w-[76px]" : "w-[260px]",
        )}
      >
        <div
          className={cn(
            "flex h-14 shrink-0 items-center border-b border-sidebar-border/60 px-3",
            collapsed && "justify-center px-2",
          )}
        >
          <Link
            href="/"
            className={cn(
              "flex items-center gap-2.5 font-semibold tracking-tight text-foreground transition-opacity hover:opacity-80",
              collapsed && "justify-center",
            )}
          >
            <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-elevated-sm">
              <Store className="size-3.5" strokeWidth={1.75} aria-hidden />
            </div>
            {!collapsed && <span className="truncate text-[15px]">Najino</span>}
          </Link>
        </div>

        <nav
          className="scrollbar-premium flex flex-1 flex-col gap-4 overflow-y-auto overscroll-contain p-2.5"
          aria-label="Main"
        >
          {navigationGroups.map((group, gi) => (
            <div key={group.labelKey ?? `g-${gi}`} className="flex flex-col gap-0.5">
              {group.labelKey && !collapsed && (
                <p className="mb-1.5 px-2.5 text-[10px] font-semibold tracking-[0.08em] text-muted-foreground/60 uppercase">
                  {t(group.labelKey)}
                </p>
              )}
              {group.items.map((item) => (
                <NavLink
                  key={item.nameKey}
                  item={item}
                  collapsed={collapsed}
                  onNavigate={onNavigate}
                  tipSide={tipSide}
                />
              ))}
            </div>
          ))}
        </nav>

        <div
          className={cn(
            "shrink-0 border-t border-sidebar-border/60 p-2.5",
            collapsed && "flex justify-center",
          )}
        >
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="flex size-9 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
                  onClick={() => setTheme(isDark ? "light" : "dark")}
                  aria-label={tCommon("darkMode")}
                >
                  {isDark ? (
                    <Sun className="size-4" strokeWidth={1.5} />
                  ) : (
                    <Moon className="size-4" strokeWidth={1.5} />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side={tipSide}>{tCommon("darkMode")}</TooltipContent>
            </Tooltip>
          ) : (
            <div className="flex items-center justify-between gap-3 rounded-xl bg-muted/50 px-3 py-2.5">
              <div className="flex items-center gap-2">
                {isDark ? (
                  <Moon className="size-3.5 text-muted-foreground" strokeWidth={1.5} aria-hidden />
                ) : (
                  <Sun className="size-3.5 text-muted-foreground" strokeWidth={1.5} aria-hidden />
                )}
                <Label htmlFor="sidebar-dark-mode" className="text-xs font-medium">
                  {tCommon("darkMode")}
                </Label>
              </div>
              <Switch
                id="sidebar-dark-mode"
                checked={isDark}
                disabled={!mounted}
                onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                aria-label={tCommon("darkMode")}
              />
            </div>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
}
