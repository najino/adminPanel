"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { TrendingDown, TrendingUp, Inbox, type LucideIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { sparkFromTrend } from "@/components/charts/spark-utils";
import { SparklineLazy } from "@/components/shared/lazy-widgets";

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
  emerald: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  blue: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  violet: "bg-violet-500/15 text-violet-600 dark:text-violet-400",
  amber: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  rose: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
  cyan: "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400",
  primary: "bg-primary/15 text-primary",
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
        "group relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-border/70 bg-card p-5 shadow-elevated-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-elevated-md motion-reduce:transition-none motion-reduce:hover:translate-y-0 dark:border-white/5",
        className,
      )}
    >
      {spark && !isLoading && (
        <div className={cn("w-full", isPositive ? "spark-glow" : "spark-glow-down")}>
          <SparklineLazy data={spark} positive={isPositive} color="auto" className="h-12" />
        </div>
      )}

      <div className="flex items-center gap-2">
        {Icon && (
          <div
            className={cn(
              "flex size-8 shrink-0 items-center justify-center rounded-lg",
              accentMap[accent],
            )}
          >
            <Icon className="size-4" strokeWidth={1.75} aria-hidden />
          </div>
        )}
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
      </div>

      {isLoading ? (
        <Skeleton className="h-9 w-28" />
      ) : (
        <p className="text-3xl font-bold tracking-tight text-foreground tabular-nums">
          {value}
        </p>
      )}

      {trend !== undefined && !isLoading ? (
        <div
          className={cn(
            "mt-auto flex items-center gap-1 text-sm font-semibold",
            isPositive ? "text-success" : "text-destructive",
          )}
        >
          {isPositive ? (
            <TrendingUp className="size-4" aria-hidden />
          ) : (
            <TrendingDown className="size-4" aria-hidden />
          )}
          <span className="tabular-nums">
            {isPositive ? "+" : ""}
            {trend}%
          </span>
        </div>
      ) : null}
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
    <div className="mb-8 flex flex-col gap-4">
      {showBreadcrumbs && <Breadcrumbs className="mb-0" />}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1.5">
          {eyebrow && (
            <p className="text-xs font-medium tracking-wider text-primary uppercase">{eyebrow}</p>
          )}
          <h1 className="text-2xl font-bold tracking-tight text-foreground lg:text-3xl">
            {title}
          </h1>
          {description && (
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">{description}</p>
          )}
        </div>
        {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
      </div>
    </div>
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
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border bg-muted/40 px-6 py-16 text-center dark:border-white/10 dark:bg-card/40">
      <div className="flex size-12 items-center justify-center rounded-2xl bg-muted">
        <Icon className="size-5 text-muted-foreground" aria-hidden />
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-base font-medium text-foreground">{title}</p>
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
