"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { ColumnDef } from "@tanstack/react-table";
import { Printer } from "lucide-react";
import { toast } from "sonner";
import { PageTransition } from "@/components/shared/page-transition";
import { PageHeader, StatusBadge } from "@/components/shared/page-elements";
import { DataTable } from "@/components/tables/data-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getOrder, updateOrderStatus } from "@/services/data.service";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { OrderItem, OrderStatus } from "@/types";

export default function OrderDetailPage() {
  const t = useTranslations("orders");
  const tCommon = useTranslations("common");
  const params = useParams();
  const orderId = params.id as string;
  const queryClient = useQueryClient();

  const { data: order, isLoading } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => getOrder(orderId),
    enabled: !!orderId,
  });

  const statusMutation = useMutation({
    mutationFn: (status: OrderStatus) => updateOrderStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order", orderId] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success(t("detail.actions.changeStatus"));
    },
    onError: () => toast.error("Failed to update status"),
  });

  const itemColumns: ColumnDef<OrderItem>[] = [
    {
      accessorKey: "productName",
      header: t("detail.items.columns.product"),
    },
    {
      accessorKey: "quantity",
      header: t("detail.items.columns.qty"),
    },
    {
      accessorKey: "price",
      header: t("detail.items.columns.price"),
      cell: ({ row }) => formatCurrency(row.original.price),
    },
    {
      id: "total",
      header: t("detail.items.columns.total"),
      cell: ({ row }) => formatCurrency(row.original.price * row.original.quantity),
    },
  ];

  if (isLoading) {
    return (
      <PageTransition>
        <p className="text-muted-foreground">{tCommon("loading")}</p>
      </PageTransition>
    );
  }

  if (!order) {
    return (
      <PageTransition>
        <p className="text-muted-foreground">{tCommon("noData")}</p>
      </PageTransition>
    );
  }

  const timeline = order.timeline ?? [
    { status: "pending" as const, date: order.date },
  ];

  return (
    <PageTransition>
      <PageHeader
        title={t("detail.information.title")}
        action={
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href={`/orders/${orderId}/invoice`}>
                <Printer className="mr-1 h-4 w-4" />
                {t("detail.actions.printInvoice")}
              </Link>
            </Button>
            <Select
              value={order.status}
              onValueChange={(v) => statusMutation.mutate(v as OrderStatus)}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">{t("filters.status.pending")}</SelectItem>
                <SelectItem value="processing">{t("filters.status.processing")}</SelectItem>
                <SelectItem value="shipped">{t("filters.status.shipped")}</SelectItem>
                <SelectItem value="delivered">{t("filters.status.delivered")}</SelectItem>
                <SelectItem value="cancelled">{t("filters.status.cancelled")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>{t("detail.information.title")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>{t("detail.information.orderId", { id: order.id })}</p>
              <p>{t("detail.information.date", { date: formatDate(order.date) })}</p>
              <p>
                {t("detail.information.items", {
                  count: order.items?.length ?? order.products.length,
                })}
              </p>
              <p>{t("detail.information.source")}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("detail.items.title")}</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={itemColumns}
                data={order.items ?? []}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("detail.timeline.title")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {timeline.map((step, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                    <div>
                      <p className="font-medium capitalize">
                        {t(`detail.timeline.${step.status === "pending" ? "orderPlaced" : step.status}`)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(step.date)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("detail.summary.title")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span>{t("detail.summary.status")}</span>
                <StatusBadge status={order.status} />
              </div>
              <div className="flex justify-between">
                <span>{t("detail.summary.date")}</span>
                <span>{formatDate(order.date)}</span>
              </div>
              <div className="flex justify-between border-t pt-3 font-semibold">
                <span>{t("detail.summary.total")}</span>
                <span>{formatCurrency(order.amount)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("detail.customer.title")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="font-medium">{order.customerName}</p>
              {order.customerEmail && (
                <p className="text-muted-foreground">{order.customerEmail}</p>
              )}
            </CardContent>
          </Card>

          {order.paymentMethod && (
            <Card>
              <CardHeader>
                <CardTitle>{t("detail.paymentInfo.title")}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <p>{order.paymentMethod}</p>
                <p className="text-muted-foreground">{t("detail.paymentInfo.paid")}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
