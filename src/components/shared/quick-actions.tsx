"use client";

import Link from "next/link";
import {
  FileText,
  LucideIcon,
  PackagePlus,
  Settings,
  ShoppingCart,
  Ticket,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickAction {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
}

const defaultActions: QuickAction[] = [
  {
    href: "/products/create",
    label: "Add product",
    description: "Create a new listing",
    icon: PackagePlus,
  },
  {
    href: "/orders",
    label: "Orders",
    description: "Review open carts",
    icon: ShoppingCart,
  },
  {
    href: "/coupons",
    label: "Coupons",
    description: "Discount codes",
    icon: Ticket,
  },
  {
    href: "/weblog/create",
    label: "Write post",
    description: "Publish content",
    icon: FileText,
  },
  {
    href: "/users",
    label: "Customers",
    description: "Manage accounts",
    icon: Users,
  },
  {
    href: "/general-setting",
    label: "Settings",
    description: "Store preferences",
    icon: Settings,
  },
];

export function QuickActions({
  actions = defaultActions,
  className,
  compact = false,
}: {
  actions?: QuickAction[];
  className?: string;
  compact?: boolean;
}) {
  const cols =
    actions.length <= 4
      ? "sm:grid-cols-2 lg:grid-cols-4"
      : "sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6";

  return (
    <div className={cn("grid gap-3", cols, className)}>
      {actions.map(({ href, label, description, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            "group flex flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-background/50 p-6 text-center transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-accent/40 motion-reduce:transition-none motion-reduce:hover:translate-y-0 dark:border-white/10 dark:bg-transparent dark:hover:bg-white/[0.03]",
            compact ? "min-h-[120px]" : "min-h-[140px]",
          )}
        >
          <div className="flex size-12 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors group-hover:border-primary/40 group-hover:text-primary dark:border-white/10">
            <Icon className="size-5" strokeWidth={1.75} aria-hidden />
          </div>
          <div className="min-w-0 flex flex-col gap-0.5">
            <span className="text-sm font-semibold text-foreground">{label}</span>
            {!compact && (
              <span className="truncate text-xs text-muted-foreground">{description}</span>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}
