"use client";

import Link from "next/link";
import { LucideIcon, PackagePlus, ShoppingCart, Ticket, FileText } from "lucide-react";
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
    href: "/orders/create",
    label: "Create order",
    description: "Manual order entry",
    icon: ShoppingCart,
  },
  {
    href: "/coupons",
    label: "Manage coupons",
    description: "Discount codes",
    icon: Ticket,
  },
  {
    href: "/weblog/create",
    label: "Write post",
    description: "Publish content",
    icon: FileText,
  },
];

export function QuickActions({
  actions = defaultActions,
  className,
}: {
  actions?: QuickAction[];
  className?: string;
}) {
  return (
    <div className={cn("grid gap-3 sm:grid-cols-2 lg:grid-cols-4", className)}>
      {actions.map(({ href, label, description, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className="group flex items-center gap-3 rounded-xl border border-border/70 bg-card p-4 shadow-elevated-sm transition-all duration-200 hover:border-primary/30 hover:shadow-elevated-md motion-reduce:transition-none"
        >
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
            <Icon className="size-[18px]" aria-hidden />
          </div>
          <div className="min-w-0 flex flex-col gap-0.5">
            <span className="text-sm font-medium">{label}</span>
            <span className="truncate text-xs text-muted-foreground">{description}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
