"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Printer } from "lucide-react";
import { PageTransition } from "@/components/shared/page-transition";
import { Button } from "@/components/ui/button";
import { getOrder } from "@/services/data.service";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function InvoicePage() {
  const t = useTranslations("orders");
  const tCommon = useTranslations("common");
  const params = useParams();
  const orderId = params.id as string;

  const { data: order, isLoading } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => getOrder(orderId),
    enabled: !!orderId,
  });

  const handlePrint = () => window.print();

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

  const subtotal = order.subtotal ?? order.amount;
  const tax = order.tax ?? 0;

  return (
    <PageTransition>
      <div className="mb-6 flex justify-end print:hidden">
        <Button onClick={handlePrint}>
          <Printer className="mr-1 h-4 w-4" />
          {t("invoice.print")}
        </Button>
      </div>

      <div className="mx-auto max-w-2xl rounded-xl border border-border bg-card p-8 print:border-0 print:shadow-none">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">{t("invoice.title")}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{order.id}</p>
            <p className="text-sm text-muted-foreground">{formatDate(order.date)}</p>
          </div>
          <div className="text-end">
            <p className="font-semibold">{t("invoice.companyName")}</p>
          </div>
        </div>

        <div className="mb-8">
          <p className="text-sm font-medium text-muted-foreground">{t("invoice.billTo")}</p>
          <p className="font-medium">{order.customerName}</p>
          {order.customerEmail && (
            <p className="text-sm text-muted-foreground">{order.customerEmail}</p>
          )}
        </div>

        <table className="mb-8 w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="py-2 text-start font-medium">{t("invoice.columns.product")}</th>
              <th className="py-2 text-center font-medium">{t("invoice.columns.qty")}</th>
              <th className="py-2 text-end font-medium">{t("invoice.columns.price")}</th>
              <th className="py-2 text-end font-medium">{t("invoice.columns.total")}</th>
            </tr>
          </thead>
          <tbody>
            {(order.items ?? []).map((item, i) => (
              <tr key={i} className="border-b border-border">
                <td className="py-3">{item.productName}</td>
                <td className="py-3 text-center">{item.quantity}</td>
                <td className="py-3 text-end">{formatCurrency(item.price)}</td>
                <td className="py-3 text-end">
                  {formatCurrency(item.price * item.quantity)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="space-y-1 text-end text-sm">
          <p>{t("invoice.subtotal", { amount: formatCurrency(subtotal) })}</p>
          {tax > 0 && <p>{t("invoice.tax", { amount: formatCurrency(tax) })}</p>}
          <p className="text-lg font-bold">
            {t("invoice.total", { amount: formatCurrency(order.amount) })}
          </p>
        </div>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          {t("invoice.footer")}
        </p>
      </div>
    </PageTransition>
  );
}
