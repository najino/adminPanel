"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";
import { PageTransition } from "@/components/shared/page-transition";
import { PageHeader, StatusBadge } from "@/components/shared/page-elements";
import { DataTable } from "@/components/tables/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getOrders } from "@/services/data.service";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Order } from "@/types";

export default function OrdersPage() {
  const t = useTranslations("orders");
  const tCommon = useTranslations("common");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["orders", search, status],
    queryFn: () =>
      getOrders({
        search: search || undefined,
        status: status !== "all" ? status : undefined,
      }),
  });

  const columns: ColumnDef<Order>[] = [
    {
      accessorKey: "id",
      header: t("table.columns.orderId"),
      cell: ({ row }) => (
        <Link href={`/orders/${row.original.id}`} className="font-medium text-primary hover:underline">
          {row.original.id}
        </Link>
      ),
    },
    {
      accessorKey: "customerName",
      header: t("table.columns.customer"),
    },
    {
      accessorKey: "products",
      header: tCommon("table.products"),
      cell: ({ row }) => row.original.products.join(", "),
    },
    {
      accessorKey: "date",
      header: t("table.columns.date"),
      cell: ({ row }) => formatDate(row.original.date),
    },
    {
      accessorKey: "amount",
      header: t("table.columns.total"),
      cell: ({ row }) => formatCurrency(row.original.amount),
    },
    {
      accessorKey: "status",
      header: t("table.columns.orderStatus"),
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: "actions",
      header: t("table.columns.actions"),
      cell: ({ row }) => (
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/orders/${row.original.id}`}>
            <Eye className="h-4 w-4" />
          </Link>
        </Button>
      ),
    },
  ];

  return (
    <PageTransition>
      <PageHeader
        title={t("pageTitle")}
        action={
          <Button asChild>
            <Link href="/orders/create">{t("addButton")}</Link>
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap gap-3">
        <Input
          placeholder={t("filters.searchPlaceholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder={t("filters.allStatus")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("filters.allStatus")}</SelectItem>
            <SelectItem value="pending">{t("filters.status.pending")}</SelectItem>
            <SelectItem value="processing">{t("filters.status.processing")}</SelectItem>
            <SelectItem value="shipped">{t("filters.status.shipped")}</SelectItem>
            <SelectItem value="delivered">{t("filters.status.delivered")}</SelectItem>
            <SelectItem value="cancelled">{t("filters.status.cancelled")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={orders}
        isLoading={isLoading}
        emptyTitle={tCommon("noData")}
      />
    </PageTransition>
  );
}
