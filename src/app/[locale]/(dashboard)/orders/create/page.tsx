"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { PageTransition } from "@/components/shared/page-transition";
import { PageHeader } from "@/components/shared/page-elements";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createOrder } from "@/services/data.service";

const schema = z.object({
  customerName: z.string().min(1),
  productIds: z.string().min(1),
});

type FormData = z.infer<typeof schema>;

export default function CreateOrderPage() {
  const t = useTranslations("orders");
  const tCommon = useTranslations("common");
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: createOrder,
    onSuccess: (order) => {
      toast.success(tCommon("save"));
      router.push(`/orders/${order.id}`);
    },
    onError: () => toast.error(tCommon("saveFailed")),
  });

  return (
    <PageTransition>
      <PageHeader title={t("addButton")} />

      <Card>
        <CardHeader>
          <CardTitle>{t("addButton")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label>{t("table.columns.customer")}</Label>
                <Input placeholder="Customer name" {...register("customerName")} />
                {errors.customerName && (
                  <p className="text-sm text-destructive">{errors.customerName.message}</p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Label>{tCommon("table.products")}</Label>
                <Input placeholder="Product IDs (comma-separated)" {...register("productIds")} />
                {errors.productIds && (
                  <p className="text-sm text-destructive">{errors.productIds.message}</p>
                )}
              </div>
            </div>
            <div className="flex gap-3">
              <Button type="submit" disabled={mutation.isPending}>
                {tCommon("save")}
              </Button>
              <Button variant="outline" asChild>
                <Link href="/orders">{tCommon("cancel")}</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </PageTransition>
  );
}
