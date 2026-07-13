"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Check, Trash2, X, Star } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { PageHeader, StatusBadge } from "@/components/shared/page-elements";
import { PageTransition } from "@/components/shared/page-transition";
import { DataTable } from "@/components/tables/data-table";
import { Button } from "@/components/ui/button";
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
import {
  deleteProductReview,
  getProductReviews,
  updateProductReviewStatus,
} from "@/services/product.service";
import type { AdminProductReview, ProductReviewStatus } from "@/types/api/products";

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating}/5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={
            i < rating
              ? "size-3.5 fill-amber-400 text-amber-400"
              : "size-3.5 text-muted-foreground/40"
          }
        />
      ))}
    </div>
  );
}

export default function ProductCommentsPage() {
  const t = useTranslations("products.reviews");
  const tp = useTranslations("pages");
  const ts = useTranslations("common.status");
  const tc = useTranslations("common");
  const queryClient = useQueryClient();
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["product-reviews"],
    queryFn: () => getProductReviews(),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ProductReviewStatus }) =>
      updateProductReviewStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-reviews"] });
      toast.success(tc("save"));
    },
    onError: () => toast.error(tc("saveFailed")),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProductReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-reviews"] });
      setDeleteTarget(null);
      toast.success(tc("delete"));
    },
    onError: () => toast.error(tc("saveFailed")),
  });

  const columns: ColumnDef<AdminProductReview>[] = [
    { accessorKey: "authorName", header: t("columns.user") },
    { accessorKey: "productName", header: t("columns.product") },
    {
      accessorKey: "content",
      header: t("columns.comment"),
      cell: ({ row }) => (
        <div className="max-w-xs">
          {row.original.title && (
            <p className="mb-0.5 text-xs font-medium text-muted-foreground">{row.original.title}</p>
          )}
          <span className="line-clamp-1">{row.original.content}</span>
        </div>
      ),
    },
    {
      accessorKey: "rating",
      header: t("columns.rating"),
      cell: ({ row }) => <RatingStars rating={row.original.rating} />,
    },
    { accessorKey: "date", header: t("columns.date") },
    {
      accessorKey: "status",
      header: t("columns.status"),
      cell: ({ row }) => (
        <StatusBadge status={row.original.status} label={ts(row.original.status)} />
      ),
    },
    {
      id: "actions",
      header: tc("actions"),
      cell: ({ row }) => (
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            title={t("approve")}
            onClick={() =>
              statusMutation.mutate({ id: row.original.id, status: "approved" })
            }
          >
            <Check className="h-4 w-4 text-success" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            title={t("reject")}
            onClick={() =>
              statusMutation.mutate({ id: row.original.id, status: "rejected" })
            }
          >
            <X className="h-4 w-4 text-destructive" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            title={t("delete")}
            onClick={() => setDeleteTarget(row.original.id)}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <PageTransition>
      <PageHeader title={tp("titles.allProductComments")} />
      <DataTable
        columns={columns}
        data={reviews}
        searchKey="content"
        searchPlaceholder={t("searchPlaceholder")}
        isLoading={isLoading}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{tc("delete")}</AlertDialogTitle>
            <AlertDialogDescription>{tc("confirmDelete")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tc("cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget)}>
              {tc("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageTransition>
  );
}
