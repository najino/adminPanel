"use client";

import Link from "next/link";
import {
  CreditCard,
  MessageSquare,
  Package,
  RefreshCcw,
  ShoppingCart,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type ActivityType =
  | "order"
  | "payment"
  | "refund"
  | "user"
  | "message"
  | "inventory";

export interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  time: string;
  href?: string;
}

const typeMeta: Record<ActivityType, { icon: LucideIcon; className: string }> = {
  order: { icon: ShoppingCart, className: "bg-primary/10 text-primary" },
  payment: { icon: CreditCard, className: "bg-success-muted text-success" },
  refund: { icon: RefreshCcw, className: "bg-warning-muted text-warning" },
  user: { icon: UserPlus, className: "bg-info-muted text-info" },
  message: { icon: MessageSquare, className: "bg-secondary text-secondary-foreground" },
  inventory: { icon: Package, className: "bg-destructive/10 text-destructive" },
};

export function ActivityTimeline({
  items,
  className,
}: {
  items: ActivityItem[];
  className?: string;
}) {
  return (
    <ul className={cn("flex flex-col", className)}>
      {items.map((item, index) => {
        const meta = typeMeta[item.type];
        const Icon = meta.icon;
        const content = (
          <div className="flex gap-3">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-xl",
                  meta.className,
                )}
              >
                <Icon className="size-4" aria-hidden />
              </div>
              {index < items.length - 1 && (
                <div className="my-1 w-px flex-1 bg-border" aria-hidden />
              )}
            </div>
            <div className="min-w-0 flex-1 pb-5">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold text-foreground">{item.title}</p>
                <time className="shrink-0 text-xs text-muted-foreground tabular-nums">
                  {item.time}
                </time>
              </div>
              <p className="mt-0.5 text-sm text-muted-foreground">{item.description}</p>
            </div>
          </div>
        );

        return (
          <li key={item.id}>
            {item.href ? (
              <Link
                href={item.href}
                className="-mx-2 block rounded-xl px-2 transition-colors hover:bg-muted/40"
              >
                {content}
              </Link>
            ) : (
              content
            )}
          </li>
        );
      })}
    </ul>
  );
}
