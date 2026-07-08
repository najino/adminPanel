"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { ColumnDef } from "@tanstack/react-table";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageTransition } from "@/components/shared/page-transition";
import { PageHeader, StatusBadge } from "@/components/shared/page-elements";
import { DataTable } from "@/components/tables/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { getCoupons, createCoupon, deleteCoupon } from "@/services/data.service";
import { formatDate } from "@/lib/utils";
import type { Coupon } from "@/types";

const couponSchema = z.object({
  couponCode: z.string().min(1),
  discountType: z.enum(["percent", "fixed"]),
  discountValue: z.coerce.number().min(0),
  expiryDate: z.string().min(1),
  minOrder: z.coerce.number().min(0),
  usageLimit: z.coerce.number().min(1),
});

type CouponForm = z.infer<typeof couponSchema>;

export default function CouponsPage() {
  const t = useTranslations("coupons");
  const tCommon = useTranslations("common");
  const queryClient = useQueryClient();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: coupons = [], isLoading } = useQuery({
    queryKey: ["coupons"],
    queryFn: getCoupons,
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CouponForm>({
    resolver: zodResolver(couponSchema),
    defaultValues: { discountType: "percent", minOrder: 0, usageLimit: 100 },
  });

  const discountType = watch("discountType");

  const createMutation = useMutation({
    mutationFn: createCoupon,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
      reset();
      setDialogOpen(false);
      toast.success(t("modal.createCoupon"));
    },
    onError: () => toast.error("Failed to create coupon"),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCoupon,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
      setDeleteId(null);
      toast.success(t("deleteModal.delete"));
    },
    onError: () => toast.error("Failed to delete coupon"),
  });

  const columns: ColumnDef<Coupon>[] = [
    {
      accessorKey: "couponCode",
      header: t("table.columns.code"),
      cell: ({ row }) => (
        <span className="font-mono font-medium">{row.original.couponCode}</span>
      ),
    },
    {
      accessorKey: "discountValue",
      header: t("table.columns.discount"),
      cell: ({ row }) =>
        row.original.discountType === "percent"
          ? `${row.original.discountValue}%`
          : `$${row.original.discountValue}`,
    },
    {
      accessorKey: "usage",
      header: t("table.columns.usage"),
      cell: ({ row }) =>
        t("table.usageFormat", {
          used: row.original.usage,
          max: row.original.usageLimit,
        }),
    },
    {
      accessorKey: "expiryDate",
      header: t("table.columns.expires"),
      cell: ({ row }) => formatDate(row.original.expiryDate),
    },
    {
      accessorKey: "status",
      header: t("table.columns.status"),
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: "actions",
      header: t("table.columns.actions"),
      cell: ({ row }) => (
        <Button variant="ghost" size="sm" onClick={() => setDeleteId(row.original.id)}>
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      ),
    },
  ];

  const activeCount = coupons.filter((c) => c.status === "active").length;

  return (
    <PageTransition>
      <PageHeader
        title={t("pageTitle")}
        description={t("table.activeCount", { count: activeCount })}
        action={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-1 h-4 w-4" />
                {t("table.addCoupon")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("modal.addTitle")}</DialogTitle>
              </DialogHeader>
              <form
                onSubmit={handleSubmit((data) => createMutation.mutate(data))}
                className="flex flex-col gap-4"
              >
                <div className="flex flex-col gap-2">
                  <Label>{t("modal.couponCode")}</Label>
                  <Input
                    placeholder={t("modal.codePlaceholder")}
                    {...register("couponCode")}
                  />
                  {errors.couponCode && (
                    <p className="text-sm text-destructive">{errors.couponCode.message}</p>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <Label>{t("modal.discountType")}</Label>
                  <Select
                    value={discountType}
                    onValueChange={(v) => setValue("discountType", v as CouponForm["discountType"])}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percent">{t("modal.percentageOption")}</SelectItem>
                      <SelectItem value="fixed">{t("modal.fixedOption")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label>{t("modal.discountValue")}</Label>
                  <Input
                    type="number"
                    placeholder={
                      discountType === "percent"
                        ? t("modal.percentagePlaceholder")
                        : t("modal.amountPlaceholder")
                    }
                    {...register("discountValue")}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>{t("modal.expiryDate")}</Label>
                  <Input type="date" {...register("expiryDate")} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-2">
                    <Label>{t("modal.minOrder")}</Label>
                    <Input type="number" {...register("minOrder")} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label>{t("modal.usageLimit")}</Label>
                    <Input type="number" {...register("usageLimit")} />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    {t("modal.cancel")}
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending}>
                    {t("modal.createCoupon")}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <DataTable
        columns={columns}
        data={coupons}
        isLoading={isLoading}
        emptyTitle={t("table.empty.title")}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteModal.title")}</AlertDialogTitle>
            <AlertDialogDescription>{t("deleteModal.description")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("deleteModal.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
            >
              {t("deleteModal.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageTransition>
  );
}
