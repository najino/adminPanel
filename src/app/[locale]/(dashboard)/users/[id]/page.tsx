"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowLeft } from "lucide-react";
import { PageTransition } from "@/components/shared/page-transition";
import { PageHeader, StatusBadge } from "@/components/shared/page-elements";
import { DataTable } from "@/components/tables/data-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCustomer, getOrders } from "@/services/data.service";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Order } from "@/types";

export default function UserDetailPage() {
  const t = useTranslations("users");
  const tCommon = useTranslations("common");
  const params = useParams();
  const userId = params.id as string;

  const { data: customer, isLoading } = useQuery({
    queryKey: ["customer", userId],
    queryFn: () => getCustomer(userId),
    enabled: !!userId,
  });

  const { data: allOrders = [] } = useQuery({
    queryKey: ["orders"],
    queryFn: () => getOrders(),
  });

  const customerOrders = allOrders.filter((o) => o.customerId === userId);

  const orderColumns: ColumnDef<Order>[] = [
    {
      accessorKey: "id",
      header: t("detail.orderHistory.columns.orderId"),
      cell: ({ row }) => (
        <Link href={`/orders/${row.original.id}`} className="text-primary hover:underline">
          {row.original.id}
        </Link>
      ),
    },
    {
      accessorKey: "date",
      header: t("detail.orderHistory.columns.date"),
      cell: ({ row }) => formatDate(row.original.date),
    },
    {
      accessorKey: "amount",
      header: t("detail.orderHistory.columns.total"),
      cell: ({ row }) => formatCurrency(row.original.amount),
    },
    {
      accessorKey: "status",
      header: t("detail.orderHistory.columns.status"),
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
  ];

  if (isLoading) {
    return (
      <PageTransition>
        <p className="text-muted-foreground">{tCommon("loading")}</p>
      </PageTransition>
    );
  }

  if (!customer) {
    return (
      <PageTransition>
        <p className="text-muted-foreground">{tCommon("noData")}</p>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <PageHeader
        title={customer.name}
        action={
          <Button variant="outline" asChild>
            <Link href="/users">
              <ArrowLeft className="mr-1 h-4 w-4" />
              {t("pageTitle")}
            </Link>
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>{t("detail.information.title")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="text-muted-foreground">{t("detail.information.fullName")}</p>
              <p className="font-medium">{customer.name}</p>
            </div>
            <div>
              <p className="text-muted-foreground">{t("detail.information.userId")}</p>
              <p>{customer.id}</p>
            </div>
            <div>
              <p className="text-muted-foreground">{t("detail.information.email")}</p>
              <p>{customer.email}</p>
            </div>
            <div>
              <p className="text-muted-foreground">{t("detail.information.phone")}</p>
              <p>{customer.phone}</p>
            </div>
            <div>
              <p className="text-muted-foreground">{t("detail.information.registrationDate")}</p>
              <p>{formatDate(new Date().toISOString())}</p>
            </div>
            <StatusBadge status={customer.status} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              {t("detail.orderHistory.title")} ({t("detail.orderHistory.count", { count: customerOrders.length })})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable columns={orderColumns} data={customerOrders} />
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
