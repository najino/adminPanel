"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { ChevronDown, ChevronRight, Moon, Store, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { navigationGroups, type NavItem } from "@/config/navigation";
import { getNavIcon } from "@/config/navigation-icons";
import { useState } from "react";
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
  const Icon = getNavIcon(item.nameKey);
  const label = t(item.nameKey);

  if (item.children) {
    return (
      <div className="flex flex-col gap-0.5">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          className={cn(
            "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-sidebar-foreground transition-colors duration-150 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground motion-reduce:transition-none",
            collapsed && "justify-center px-2",
          )}
        >
          <Icon className="size-[18px] shrink-0 opacity-70" aria-hidden />
          {!collapsed && (
            <>
              <span className="flex-1 text-start">{label}</span>
              {open ? (
                <ChevronDown className="size-4 opacity-50" aria-hidden />
              ) : (
                <ChevronRight className="size-4 opacity-50" aria-hidden />
              )}
            </>
          )}
        </button>
        {open && !collapsed && (
          <div className="ms-4 flex flex-col gap-0.5 border-s border-sidebar-border ps-3">
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
        )}
      </div>
    );
  }

  const isActive =
    item.href === "/" ? pathname === "/" || pathname.endsWith("/") : pathname.includes(item.href!);

  const linkContent = (
    <Link
      href={item.href!}
      onClick={onNavigate}
      className={cn(
        "relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors duration-150 motion-reduce:transition-none",
        isActive
          ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
          : "text-sidebar-foreground hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground",
        collapsed && "justify-center px-2",
        depth > 0 && "py-1.5 text-[13px]",
      )}
    >
      {isActive && (
        <span
          className="absolute inset-y-1.5 start-0 w-0.5 rounded-full bg-sidebar-primary"
          aria-hidden
        />
      )}
      <Icon
        className={cn(
          "size-[18px] shrink-0",
          depth > 0 && "size-4",
          isActive ? "text-sidebar-primary" : "opacity-60",
        )}
        aria-hidden
      />
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
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "flex h-full flex-col rounded-2xl border border-sidebar-border/80 bg-sidebar text-sidebar-foreground shadow-elevated-md transition-[width] duration-300 motion-reduce:transition-none",
          collapsed ? "w-[76px]" : "w-[260px]",
        )}
      >
        <div
          className={cn(
            "flex h-14 shrink-0 items-center border-b border-sidebar-border/70 px-4",
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
              <Store className="size-4" aria-hidden />
            </div>
            {!collapsed && <span className="truncate text-[15px]">Najino</span>}
          </Link>
        </div>

        <nav className="flex flex-1 flex-col gap-4 overflow-y-auto p-3" aria-label="Main">
          {navigationGroups.map((group, gi) => (
            <div key={group.labelKey ?? `g-${gi}`} className="flex flex-col gap-0.5">
              {group.labelKey && !collapsed && (
                <p className="mb-1 px-3 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
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
            "mt-auto border-t border-sidebar-border/70 p-3",
            collapsed && "flex justify-center",
          )}
        >
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="flex size-9 items-center justify-center rounded-xl text-sidebar-foreground hover:bg-sidebar-accent"
                  onClick={() => setTheme(isDark ? "light" : "dark")}
                  aria-label={tCommon("darkMode")}
                >
                  {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
                </button>
              </TooltipTrigger>
              <TooltipContent side={tipSide}>{tCommon("darkMode")}</TooltipContent>
            </Tooltip>
          ) : (
            <div className="flex items-center justify-between gap-3 rounded-xl bg-sidebar-accent/40 px-3 py-2.5">
              <div className="flex items-center gap-2">
                {isDark ? (
                  <Moon className="size-4 text-muted-foreground" aria-hidden />
                ) : (
                  <Sun className="size-4 text-muted-foreground" aria-hidden />
                )}
                <Label htmlFor="sidebar-dark-mode" className="text-xs font-medium">
                  {tCommon("darkMode")}
                </Label>
              </div>
              <Switch
                id="sidebar-dark-mode"
                checked={isDark}
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
