"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { ColumnDef } from "@tanstack/react-table";
import {
  AlertTriangle,
  Clock,
  DollarSign,
  Package,
  ShoppingCart,
  Users,
} from "lucide-react";
import { PageTransition } from "@/components/shared/page-transition";
import { PageHeader, StatCard, StatusBadge } from "@/components/shared/page-elements";
import { QuickActions } from "@/components/shared/quick-actions";
import { SectionCard } from "@/components/shared/section-card";
import { DataTable } from "@/components/tables/data-table";
import { SalesChart } from "@/components/charts/sales-chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { getDashboardStats, getChartData, getProducts, getOrders } from "@/services/data.service";
import { formatCurrency } from "@/lib/utils";
import type { Product, Order } from "@/types";

export default function DashboardPage() {
  const t = useTranslations("home");
  const tCommon = useTranslations("common");
  const tNav = useTranslations("navigation");
  const [chartPeriod, setChartPeriod] = useState<"monthly" | "quarterly" | "annually">("monthly");

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: getDashboardStats,
  });

  const { data: chartData = [], isLoading: chartLoading } = useQuery({
    queryKey: ["chart-data", chartPeriod],
    queryFn: () => getChartData(chartPeriod),
  });

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["products"],
    queryFn: () => getProducts(),
  });

  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: () => getOrders(),
  });

  const featuredProducts = products.slice(0, 5);
  const recentOrders = orders.slice(0, 5);
  const lowStockProducts = products.filter((p) => p.stock <= 10);

  const quickActions = [
    {
      href: "/products/create",
      label: tNav("addProduct"),
      description: t("featuredProducts.title"),
      icon: Package,
    },
    {
      href: "/orders/create",
      label: tNav("allOrders"),
      description: t("recentOrders.title"),
      icon: ShoppingCart,
    },
    {
      href: "/coupons",
      label: tNav("coupons"),
      description: t("kpi.totalOrders"),
      icon: DollarSign,
    },
    {
      href: "/weblog/create",
      label: tNav("addPost"),
      description: tNav("weblog"),
      icon: Users,
    },
  ];

  const featuredColumns: ColumnDef<Product>[] = [
    {
      accessorKey: "name",
      header: t("featuredProducts.columns.products"),
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          {row.original.images[0] && (
            <img
              src={row.original.images[0]}
              alt={row.original.name}
              className="size-10 rounded-lg object-cover ring-1 ring-border"
            />
          )}
          <span className="font-medium">{row.original.name}</span>
        </div>
      ),
    },
    {
      accessorKey: "price",
      header: t("featuredProducts.columns.price"),
      cell: ({ row }) => (
        <span className="tabular-nums">{formatCurrency(row.original.price)}</span>
      ),
    },
    {
      accessorKey: "category",
      header: t("featuredProducts.columns.category"),
    },
  ];

  const ordersColumns: ColumnDef<Order>[] = [
    {
      accessorKey: "products",
      header: t("recentOrders.columns.products"),
      cell: ({ row }) => (
        <span className="max-w-[180px] truncate">{row.original.products.join(", ")}</span>
      ),
    },
    {
      accessorKey: "customerName",
      header: t("recentOrders.columns.category"),
      cell: ({ row }) => row.original.customerName,
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
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
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
              className="size-10 rounded-lg object-cover ring-1 ring-border"
            />
          )}
          <span>{row.original.name}</span>
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
        title={tCommon("meta.dashboardTitle")}
        description={t("chart.subtitle")}
        showBreadcrumbs={false}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          title={t("kpi.totalRevenue")}
          value={formatCurrency(stats?.totalRevenue ?? 0)}
          trend={stats?.revenueTrend}
          isLoading={statsLoading}
          icon={DollarSign}
        />
        <StatCard
          title={t("kpi.totalOrders")}
          value={String(stats?.totalOrders ?? 0)}
          trend={stats?.ordersTrend}
          isLoading={statsLoading}
          icon={ShoppingCart}
        />
        <StatCard
          title={t("kpi.totalCustomers")}
          value={String(stats?.totalCustomers ?? 0)}
          trend={stats?.customersTrend}
          isLoading={statsLoading}
          icon={Users}
        />
        <StatCard
          title={t("kpi.totalProducts")}
          value={String(stats?.totalProducts ?? 0)}
          trend={stats?.productsTrend}
          isLoading={statsLoading}
          icon={Package}
        />
        <StatCard
          title={t("kpi.pendingOrders")}
          value={String(stats?.pendingOrders ?? 0)}
          trend={stats?.pendingTrend}
          isLoading={statsLoading}
          icon={Clock}
        />
        <StatCard
          title={t("kpi.lowStockProducts")}
          value={String(stats?.lowStockProducts ?? 0)}
          trend={stats?.lowStockTrend}
          isLoading={statsLoading}
          icon={AlertTriangle}
        />
      </div>

      <div className="mt-8 flex flex-col gap-3">
        <h2 className="text-sm font-medium text-muted-foreground">Quick actions</h2>
        <QuickActions actions={quickActions} />
      </div>

      <SectionCard title={t("chart.title")} description={t("chart.subtitle")} className="mt-8">
        <Tabs
          value={chartPeriod}
          onValueChange={(v) => setChartPeriod(v as typeof chartPeriod)}
        >
          <TabsList className="mb-4">
            <TabsTrigger value="monthly">{tCommon("chartTab.monthly")}</TabsTrigger>
            <TabsTrigger value="quarterly">{tCommon("chartTab.quarterly")}</TabsTrigger>
            <TabsTrigger value="annually">{tCommon("chartTab.annually")}</TabsTrigger>
          </TabsList>
          <TabsContent value={chartPeriod}>
            {chartLoading ? (
              <Skeleton className="h-80 w-full rounded-lg" />
            ) : (
              <SalesChart data={chartData} />
            )}
          </TabsContent>
        </Tabs>
      </SectionCard>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <SectionCard
          title={t("featuredProducts.title")}
          href="/products"
          linkLabel={tCommon("seeAll")}
        >
          <DataTable
            columns={featuredColumns}
            data={featuredProducts}
            isLoading={productsLoading}
            compact
            embedded
          />
        </SectionCard>

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
        </SectionCard>
      </div>

      <SectionCard title={t("lowStock.title")} className="mt-8">
        <DataTable
          columns={lowStockColumns}
          data={lowStockProducts}
          isLoading={productsLoading}
          embedded
        />
      </SectionCard>
    </PageTransition>
  );
}
