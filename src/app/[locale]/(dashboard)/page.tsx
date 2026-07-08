"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { ColumnDef } from "@tanstack/react-table";
import { PageTransition } from "@/components/shared/page-transition";
import { PageHeader, StatCard, StatusBadge } from "@/components/shared/page-elements";
import { DataTable } from "@/components/tables/data-table";
import { SalesChart } from "@/components/charts/sales-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getDashboardStats, getChartData, getProducts, getOrders } from "@/services/data.service";
import { formatCurrency } from "@/lib/utils";
import type { Product, Order } from "@/types";

export default function DashboardPage() {
  const t = useTranslations("home");
  const tCommon = useTranslations("common");
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
              className="h-10 w-10 rounded-lg object-cover"
            />
          )}
          <span className="font-medium">{row.original.name}</span>
        </div>
      ),
    },
    {
      accessorKey: "price",
      header: t("featuredProducts.columns.price"),
      cell: ({ row }) => formatCurrency(row.original.price),
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
      cell: ({ row }) => row.original.products.join(", "),
    },
    {
      accessorKey: "customerName",
      header: t("recentOrders.columns.category"),
      cell: ({ row }) => row.original.customerName,
    },
    {
      accessorKey: "amount",
      header: t("recentOrders.columns.price"),
      cell: ({ row }) => formatCurrency(row.original.amount),
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
              className="h-10 w-10 rounded-lg object-cover"
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
      <PageHeader title={tCommon("meta.dashboardTitle")} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          title={t("kpi.totalRevenue")}
          value={formatCurrency(stats?.totalRevenue ?? 0)}
          trend={stats?.revenueTrend}
          isLoading={statsLoading}
        />
        <StatCard
          title={t("kpi.totalOrders")}
          value={String(stats?.totalOrders ?? 0)}
          trend={stats?.ordersTrend}
          isLoading={statsLoading}
        />
        <StatCard
          title={t("kpi.totalCustomers")}
          value={String(stats?.totalCustomers ?? 0)}
          trend={stats?.customersTrend}
          isLoading={statsLoading}
        />
        <StatCard
          title={t("kpi.totalProducts")}
          value={String(stats?.totalProducts ?? 0)}
          trend={stats?.productsTrend}
          isLoading={statsLoading}
        />
        <StatCard
          title={t("kpi.pendingOrders")}
          value={String(stats?.pendingOrders ?? 0)}
          trend={stats?.pendingTrend}
          isLoading={statsLoading}
        />
        <StatCard
          title={t("kpi.lowStockProducts")}
          value={String(stats?.lowStockProducts ?? 0)}
          trend={stats?.lowStockTrend}
          isLoading={statsLoading}
        />
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>{t("chart.title")}</CardTitle>
          <p className="text-sm text-muted-foreground">{t("chart.subtitle")}</p>
        </CardHeader>
        <CardContent>
          <Tabs
            value={chartPeriod}
            onValueChange={(v) => setChartPeriod(v as typeof chartPeriod)}
          >
            <TabsList>
              <TabsTrigger value="monthly">{tCommon("chartTab.monthly")}</TabsTrigger>
              <TabsTrigger value="quarterly">{tCommon("chartTab.quarterly")}</TabsTrigger>
              <TabsTrigger value="annually">{tCommon("chartTab.annually")}</TabsTrigger>
            </TabsList>
            <TabsContent value={chartPeriod} className="mt-4">
              {chartLoading ? (
                <div className="flex h-80 items-center justify-center text-muted-foreground">
                  {tCommon("loading")}
                </div>
              ) : (
                <SalesChart data={chartData} />
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{t("featuredProducts.title")}</CardTitle>
            <Link href="/products" className="text-sm text-primary hover:underline">
              {tCommon("seeAll")}
            </Link>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={featuredColumns}
              data={featuredProducts}
              isLoading={productsLoading}
              compact
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{t("recentOrders.title")}</CardTitle>
            <Link href="/orders" className="text-sm text-primary hover:underline">
              {t("recentOrders.seeAll")}
            </Link>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={ordersColumns}
              data={recentOrders}
              isLoading={ordersLoading}
              compact
            />
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>{t("lowStock.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={lowStockColumns}
            data={lowStockProducts}
            isLoading={productsLoading}
          />
        </CardContent>
      </Card>
    </PageTransition>
  );
}
