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
}: {
  actions?: QuickAction[];
  className?: string;
}) {
  return (
    <div className={cn("grid gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6", className)}>
      {actions.map(({ href, label, description, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className="group flex flex-col gap-3 rounded-2xl border border-border/70 bg-card p-4 shadow-elevated-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-elevated-md motion-reduce:transition-none motion-reduce:hover:translate-y-0"
        >
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
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
