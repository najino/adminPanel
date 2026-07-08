import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { TrendingDown, TrendingUp, Inbox, type LucideIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";

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
}: {
  title: string;
  value: string;
  trend?: number;
  isLoading?: boolean;
  icon?: LucideIcon;
  className?: string;
}) {
  const isPositive = trend !== undefined && trend >= 0;

  return (
    <div
      className={cn(
        "group relative flex flex-col gap-3 overflow-hidden rounded-xl border border-border/80 bg-card p-4 shadow-elevated-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-elevated-md motion-reduce:transition-none motion-reduce:hover:translate-y-0 lg:p-5",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {title}
        </p>
        {Icon && (
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
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
      {trend !== undefined && !isLoading && (
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
      )}
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
    <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border bg-muted/30 px-6 py-16 text-center">
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
      className="flex flex-col items-center justify-center gap-4 rounded-xl border border-destructive/20 bg-destructive/5 px-6 py-12 text-center"
      role="alert"
    >
      <p className="text-base font-medium text-destructive">{title}</p>
      {description && <p className="max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action}
    </div>
  );
}
