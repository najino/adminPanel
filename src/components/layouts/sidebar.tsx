"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { ChevronDown, ChevronRight, Store } from "lucide-react";
import { cn } from "@/lib/utils";
import { navigationConfig, type NavItem } from "@/config/navigation";
import { getNavIcon } from "@/config/navigation-icons";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SidebarProps {
  collapsed: boolean;
  onNavigate?: () => void;
}

function NavLink({
  item,
  collapsed,
  onNavigate,
  depth = 0,
}: {
  item: NavItem;
  collapsed: boolean;
  onNavigate?: () => void;
  depth?: number;
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
            "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground transition-colors duration-150 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground motion-reduce:transition-none",
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
          <div className="flex flex-col gap-0.5 border-s border-sidebar-border ps-3 ms-4">
            {item.children.map((child) => (
              <NavLink
                key={child.nameKey}
                item={child}
                collapsed={collapsed}
                onNavigate={onNavigate}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  const isActive =
    item.href === "/" ? pathname === "/" : pathname.startsWith(item.href!);

  const linkContent = (
    <Link
      href={item.href!}
      onClick={onNavigate}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150 motion-reduce:transition-none",
        isActive
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
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
        <TooltipContent side="right">{label}</TooltipContent>
      </Tooltip>
    );
  }

  return linkContent;
}

export function Sidebar({ collapsed, onNavigate }: SidebarProps) {
  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "flex h-full flex-col border-e border-sidebar-border bg-sidebar transition-[width] duration-300 motion-reduce:transition-none",
          collapsed ? "w-[72px]" : "w-[260px]",
        )}
      >
        <div
          className={cn(
            "flex h-14 shrink-0 items-center border-b border-sidebar-border px-4",
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
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-elevated-sm">
              <Store className="size-4" aria-hidden />
            </div>
            {!collapsed && (
              <span className="truncate text-[15px]">Commerce Platform</span>
            )}
          </Link>
        </div>
        <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-3" aria-label="Main">
          {navigationConfig.map((item) => (
            <NavLink
              key={item.nameKey}
              item={item}
              collapsed={collapsed}
              onNavigate={onNavigate}
            />
          ))}
        </nav>
      </aside>
    </TooltipProvider>
  );
}
