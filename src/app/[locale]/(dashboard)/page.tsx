"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import { ColumnDef } from "@tanstack/react-table";
import {
  DollarSign,
  Package,
  PackagePlus,
  Settings,
  ShoppingCart,
  Users,
} from "lucide-react";
import { PageTransition } from "@/components/shared/page-transition";
import { PageHeader, StatCard, StatusBadge } from "@/components/shared/page-elements";
import { QuickActions } from "@/components/shared/quick-actions";
import { ActivityTimeline, type ActivityItem } from "@/components/shared/activity-timeline";
import { SectionCard } from "@/components/shared/section-card";
import { DataTable } from "@/components/tables/data-table";
import { SalesChart } from "@/components/charts/sales-chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/providers/auth-provider";
import {
  getChartData,
  getDashboardLowStock,
  getDashboardRecentOrders,
  getDashboardStats,
  type RevenuePeriod,
} from "@/services/data.service";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Product, Order } from "@/types";

export default function DashboardPage() {
  const t = useTranslations("home");
  const tCommon = useTranslations("common");
  const tNav = useTranslations("navigation");
  const locale = useLocale();
  const { user } = useAuth();
  const [chartPeriod, setChartPeriod] = useState<RevenuePeriod>("month");

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: getDashboardStats,
  });

  const { data: chartData = [], isLoading: chartLoading } = useQuery({
    queryKey: ["chart-data", chartPeriod],
    queryFn: () => getChartData(chartPeriod),
  });

  const { data: recentOrders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["dashboard-recent-orders"],
    queryFn: () => getDashboardRecentOrders(6),
  });

  const { data: lowStockProducts = [], isLoading: productsLoading } = useQuery({
    queryKey: ["dashboard-low-stock"],
    queryFn: () => getDashboardLowStock(6),
  });

  const todayLabel = useMemo(() => formatDate(new Date()), []);
  const welcomeName = user?.firstName || "admin";
  const welcomeTitle =
    locale === "fa" ? `${t("welcome")}، ${welcomeName}` : `${t("welcome")}, ${welcomeName}`;

  const quickActions = [
    {
      href: "/products/create",
      label: tNav("addProduct"),
      description: t("quickActions.addProduct"),
      icon: PackagePlus,
    },
    {
      href: "/orders",
      label: tNav("allOrders"),
      description: t("quickActions.orders"),
      icon: ShoppingCart,
    },
    {
      href: "/users",
      label: tNav("allUsers"),
      description: t("quickActions.users"),
      icon: Users,
    },
    {
      href: "/general-setting",
      label: tNav("generalSetting"),
      description: t("quickActions.settings"),
      icon: Settings,
    },
  ];

  const activityItems: ActivityItem[] = useMemo(() => {
    return recentOrders.slice(0, 8).map((o) => ({
      id: `order-${o.id}`,
      type: "order" as const,
      title: t("activity.newOrder", { id: o.id }),
      description: `${o.customerName} · ${formatCurrency(o.amount)}`,
      time: o.date ? formatDate(o.date) : "",
      href: `/orders/${o.id}`,
    }));
  }, [recentOrders, t]);

  const ordersColumns: ColumnDef<Order>[] = [
    {
      accessorKey: "customerName",
      header: t("recentOrders.columns.customer"),
      cell: ({ row }) => {
        const name = row.original.customerName;
        const initials = name
          .split(" ")
          .map((p) => p[0])
          .join("")
          .slice(0, 2)
          .toUpperCase();
        return (
          <div className="flex items-center gap-3">
            <Avatar className="size-8">
              <AvatarFallback className="text-[11px]">{initials || "—"}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{name}</p>
              <p className="truncate text-xs text-muted-foreground">
                {row.original.products.slice(0, 2).join(", ") || "—"}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "amount",
      header: t("recentOrders.columns.price"),
      cell: ({ row }) => (
        <span className="tabular-nums font-medium">{formatCurrency(row.original.amount)}</span>
      ),
    },
    {
      accessorKey: "status",
      header: t("recentOrders.columns.status"),
      cell: ({ row }) => (
        <StatusBadge
          status={row.original.status}
          label={t(`recentOrders.status.${row.original.status}` as "recentOrders.status.pending")}
        />
      ),
    },
  ];

  const lowStockColumns: ColumnDef<Product>[] = [
    {
      accessorKey: "name",
      header: t("lowStock.columns.product"),
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          {row.original.images[0] && (
            <img
              src={row.original.images[0]}
              alt={row.original.name}
              className="size-10 rounded-xl object-cover ring-1 ring-border"
            />
          )}
          <span className="font-medium">{row.original.name}</span>
        </div>
      ),
    },
    {
      accessorKey: "stock",
      header: t("lowStock.columns.stock"),
      cell: ({ row }) => (
        <span className="font-medium text-warning tabular-nums">
          {t("lowStock.left", { count: row.original.stock })}
        </span>
      ),
    },
  ];

  return (
    <PageTransition>
      <PageHeader
        title={welcomeTitle}
        description={`${t("welcomeSubtitle")} · ${todayLabel}`}
        showBreadcrumbs={false}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title={t("kpi.totalRevenue")}
          value={formatCurrency(stats?.totalRevenue ?? 0)}
          trend={stats?.revenueTrend}
          isLoading={statsLoading}
          icon={DollarSign}
          accent="emerald"
        />
        <StatCard
          title={t("kpi.totalOrders")}
          value={String(stats?.totalOrders ?? 0)}
          trend={stats?.ordersTrend}
          isLoading={statsLoading}
          icon={ShoppingCart}
          accent="blue"
        />
        <StatCard
          title={t("kpi.totalCustomers")}
          value={String(stats?.totalCustomers ?? 0)}
          trend={stats?.customersTrend}
          isLoading={statsLoading}
          icon={Users}
          accent="violet"
        />
        <StatCard
          title={t("kpi.totalProducts")}
          value={String(stats?.totalProducts ?? 0)}
          trend={stats?.productsTrend}
          isLoading={statsLoading}
          icon={Package}
          accent="cyan"
        />
      </div>

      <SectionCard title={t("quickActions.title")} className="mt-8">
        <QuickActions actions={quickActions} compact />
      </SectionCard>

      <div className="mt-8 grid gap-6 xl:grid-cols-3">
        <SectionCard
          title={t("chart.title")}
          description={t("chart.subtitle")}
          className="xl:col-span-2"
        >
          <Tabs
            value={chartPeriod}
            onValueChange={(v) => setChartPeriod(v as RevenuePeriod)}
          >
            <TabsList className="mb-4">
              <TabsTrigger value="today">{tCommon("chartTab.today")}</TabsTrigger>
              <TabsTrigger value="week">{tCommon("chartTab.week")}</TabsTrigger>
              <TabsTrigger value="month">{tCommon("chartTab.month")}</TabsTrigger>
              <TabsTrigger value="year">{tCommon("chartTab.year")}</TabsTrigger>
            </TabsList>
            <TabsContent value={chartPeriod}>
              {chartLoading ? (
                <Skeleton className="h-80 w-full rounded-xl" />
              ) : chartData.length === 0 ? (
                <p className="flex h-80 items-center justify-center text-sm text-muted-foreground">
                  {t("chart.empty")}
                </p>
              ) : (
                <SalesChart data={chartData} />
              )}
            </TabsContent>
          </Tabs>
        </SectionCard>

        <SectionCard title={t("activity.title")}>
          {ordersLoading ? (
            <div className="flex flex-col gap-3">
              <Skeleton className="h-14 w-full rounded-lg" />
              <Skeleton className="h-14 w-full rounded-lg" />
              <Skeleton className="h-14 w-full rounded-lg" />
            </div>
          ) : activityItems.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">{t("activity.empty")}</p>
          ) : (
            <ActivityTimeline items={activityItems} />
          )}
        </SectionCard>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <SectionCard
          title={t("recentOrders.title")}
          href="/orders"
          linkLabel={t("recentOrders.seeAll")}
        >
          <DataTable
            columns={ordersColumns}
            data={recentOrders}
            isLoading={ordersLoading}
            compact
            embedded
          />
          {recentOrders.length === 0 && !ordersLoading && (
            <p className="px-1 py-6 text-center text-sm text-muted-foreground">
              {t("recentOrders.empty")}
            </p>
          )}
        </SectionCard>

        <SectionCard
          title={t("lowStock.title")}
          href="/products"
          linkLabel={tCommon("seeAll")}
        >
          <DataTable
            columns={lowStockColumns}
            data={lowStockProducts}
            isLoading={productsLoading}
            compact
            embedded
          />
          {lowStockProducts.length === 0 && !productsLoading && (
            <p className="px-1 py-6 text-center text-sm text-muted-foreground">
              {t("lowStock.empty")}
            </p>
          )}
        </SectionCard>
      </div>
    </PageTransition>
  );
}
