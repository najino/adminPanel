"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { TrendingDown, TrendingUp, Inbox, type LucideIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { Sparkline, sparkFromTrend } from "@/components/charts/sparkline";

const statusVariants: Record<
  string,
  "default" | "secondary" | "destructive" | "success" | "warning" | "info"
> = {
  active: "success",
  inactive: "secondary",
  VIP: "info",
  pending: "warning",
  processing: "info",
  shipped: "info",
  delivered: "success",
  cancelled: "destructive",
  lowStock: "warning",
  outOfStock: "destructive",
  expired: "secondary",
  scheduled: "info",
  Draft: "secondary",
  Published: "success",
  Scheduled: "warning",
  approved: "success",
  rejected: "destructive",
};

const accentMap = {
  emerald: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400",
  blue: "bg-blue-500/12 text-blue-600 dark:text-blue-400",
  violet: "bg-violet-500/12 text-violet-600 dark:text-violet-400",
  amber: "bg-amber-500/12 text-amber-600 dark:text-amber-400",
  rose: "bg-rose-500/12 text-rose-600 dark:text-rose-400",
  cyan: "bg-cyan-500/12 text-cyan-600 dark:text-cyan-400",
  primary: "bg-primary/10 text-primary",
} as const;

export type StatAccent = keyof typeof accentMap;

export function StatusBadge({ status, label }: { status: string; label?: string }) {
  const variant = statusVariants[status] ?? "default";
  return (
    <Badge variant={variant} className="capitalize">
      {label ?? status}
    </Badge>
  );
}

export function StatCard({
  title,
  value,
  trend,
  isLoading,
  icon: Icon,
  className,
  accent = "primary",
  sparkData,
}: {
  title: string;
  value: string;
  trend?: number;
  isLoading?: boolean;
  icon?: LucideIcon;
  className?: string;
  accent?: StatAccent;
  sparkData?: number[];
}) {
  const isPositive = trend !== undefined && trend >= 0;
  const spark = sparkData ?? (trend !== undefined ? sparkFromTrend(trend) : undefined);

  return (
    <div
      className={cn(
        "group relative flex flex-col gap-3 overflow-hidden rounded-2xl border border-border/80 bg-card p-4 shadow-elevated-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-elevated-md motion-reduce:transition-none motion-reduce:hover:translate-y-0 lg:p-5",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {title}
        </p>
        {Icon && (
          <div
            className={cn(
              "flex size-8 shrink-0 items-center justify-center rounded-xl",
              accentMap[accent],
            )}
          >
            <Icon className="size-4" aria-hidden />
          </div>
        )}
      </div>
      {isLoading ? (
        <Skeleton className="h-8 w-28" />
      ) : (
        <p className="text-2xl font-semibold tracking-tight tabular-nums lg:text-[1.75rem]">
          {value}
        </p>
      )}
      <div className="mt-auto flex items-end justify-between gap-3">
        {trend !== undefined && !isLoading ? (
          <div
            className={cn(
              "flex items-center gap-1 text-xs font-medium",
              isPositive ? "text-success" : "text-destructive",
            )}
          >
            {isPositive ? (
              <TrendingUp className="size-3.5" aria-hidden />
            ) : (
              <TrendingDown className="size-3.5" aria-hidden />
            )}
            <span className="tabular-nums">
              {isPositive ? "+" : ""}
              {trend}%
            </span>
          </div>
        ) : (
          <span />
        )}
        {spark && !isLoading && (
          <div className="w-24 shrink-0 opacity-90">
            <Sparkline data={spark} positive={isPositive} color="auto" />
          </div>
        )}
      </div>
    </div>
  );
}

export function PageHeader({
  title,
  description,
  action,
  eyebrow,
  showBreadcrumbs = true,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  eyebrow?: string;
  showBreadcrumbs?: boolean;
}) {
  return (
    <header className="mb-8 flex flex-col gap-4">
      {showBreadcrumbs && <Breadcrumbs className="mb-0" />}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1.5">
          {eyebrow && (
            <p className="text-xs font-medium tracking-wider text-primary uppercase">{eyebrow}</p>
          )}
          <h1 className="text-2xl font-semibold tracking-tight lg:text-3xl">{title}</h1>
          {description && (
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">{description}</p>
          )}
        </div>
        {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
      </div>
    </header>
  );
}

export function EmptyState({
  title,
  description,
  action,
  icon: Icon = Inbox,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border bg-muted/30 px-6 py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted">
        <Icon className="size-5 text-muted-foreground" aria-hidden />
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-base font-medium">{title}</p>
        {description && <p className="max-w-sm text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function ErrorState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-destructive/20 bg-destructive/5 px-6 py-12 text-center"
      role="alert"
    >
      <p className="text-base font-medium text-destructive">{title}</p>
      {description && <p className="max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action}
    </div>
  );
}
