"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Check, MessageSquareReply, Trash2, X, Star } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { PageHeader, StatusBadge } from "@/components/shared/page-elements";
import { PageTransition } from "@/components/shared/page-transition";
import { FilterBar } from "@/components/shared/filter-bar";
import { DataTable } from "@/components/tables/data-table";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  deleteProductReview,
  getProductReviews,
  replyToProductReview,
  updateProductReviewStatus,
} from "@/services/product.service";
import type { AdminProductReview, ProductReviewStatus } from "@/types/api/products";
import { formatDate } from "@/lib/utils";

function RatingStars({ rating }: { rating: number }) {
  const value = Math.max(0, Math.min(5, Math.round(rating)));
  return (
    <div className="flex items-center gap-1.5" aria-label={`${rating}/5`}>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            className={
              i < value
                ? "size-3.5 fill-amber-400 text-amber-400"
                : "size-3.5 text-muted-foreground/40"
            }
          />
        ))}
      </div>
      <span className="text-xs tabular-nums text-muted-foreground">{rating}/5</span>
    </div>
  );
}

export default function ProductCommentsPage() {
  const t = useTranslations("products.reviews");
  const tp = useTranslations("pages");
  const ts = useTranslations("common.status");
  const tc = useTranslations("common");
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<"all" | ProductReviewStatus>("all");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [replyTarget, setReplyTarget] = useState<AdminProductReview | null>(null);
  const [replyText, setReplyText] = useState("");

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["product-reviews", statusFilter],
    queryFn: () =>
      getProductReviews({
        status: statusFilter === "all" ? undefined : statusFilter,
      }),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["product-reviews"] });
    queryClient.invalidateQueries({ queryKey: ["product-rating-summaries"] });
  };

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ProductReviewStatus }) =>
      updateProductReviewStatus(id, status),
    onSuccess: () => {
      invalidate();
      toast.success(tc("save"));
    },
    onError: () => toast.error(tc("saveFailed")),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProductReview,
    onSuccess: () => {
      invalidate();
      setDeleteTarget(null);
      toast.success(tc("delete"));
    },
    onError: () => toast.error(tc("saveFailed")),
  });

  const replyMutation = useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) =>
      replyToProductReview(id, content),
    onSuccess: () => {
      invalidate();
      setReplyTarget(null);
      setReplyText("");
      toast.success(t("replySent"));
    },
    onError: () => toast.error(tc("saveFailed")),
  });

  const pendingCount = useMemo(
    () => reviews.filter((r) => r.status === "pending").length,
    [reviews],
  );

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
          <span className="line-clamp-2">{row.original.content}</span>
          {row.original.hasReply && (
            <p className="mt-1 text-[11px] text-primary">{t("hasReply")}</p>
          )}
        </div>
      ),
    },
    {
      accessorKey: "rating",
      header: t("columns.rating"),
      cell: ({ row }) => <RatingStars rating={row.original.rating} />,
    },
    {
      accessorKey: "date",
      header: t("columns.date"),
      cell: ({ row }) => (
        <span className="tabular-nums text-muted-foreground">{formatDate(row.original.date)}</span>
      ),
    },
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
            title={t("reply")}
            onClick={() => {
              setReplyTarget(row.original);
              setReplyText("");
            }}
          >
            <MessageSquareReply className="h-4 w-4 text-primary" />
          </Button>
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
      <PageHeader
        title={tp("titles.allProductComments")}
        description={
          statusFilter === "all" && pendingCount > 0
            ? t("pendingHint", { count: pendingCount })
            : undefined
        }
      />

      <FilterBar>
        <Select
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value as typeof statusFilter)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t("columns.status")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("filters.allStatus")}</SelectItem>
            <SelectItem value="pending">{ts("pending")}</SelectItem>
            <SelectItem value="approved">{ts("approved")}</SelectItem>
            <SelectItem value="rejected">{ts("rejected")}</SelectItem>
          </SelectContent>
        </Select>
      </FilterBar>

      <DataTable
        columns={columns}
        data={reviews}
        searchKey="content"
        searchPlaceholder={t("searchPlaceholder")}
        isLoading={isLoading}
      />

      <Dialog
        open={!!replyTarget}
        onOpenChange={(open) => {
          if (!open) {
            setReplyTarget(null);
            setReplyText("");
          }
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("replyTitle")}</DialogTitle>
          </DialogHeader>
          {replyTarget && (
            <div className="flex flex-col gap-4">
              <div className="grid gap-2 rounded-lg border bg-muted/40 p-3 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <p>
                    <span className="text-muted-foreground">{t("columns.user")}: </span>
                    {replyTarget.authorName}
                  </p>
                  <RatingStars rating={replyTarget.rating} />
                </div>
                <p>
                  <span className="text-muted-foreground">{t("columns.product")}: </span>
                  {replyTarget.productName}
                </p>
                <p className="text-muted-foreground">{replyTarget.content}</p>
                {(replyTarget.replies?.length ?? 0) > 0 && (
                  <div className="mt-2 space-y-2 border-t pt-2">
                    <p className="text-xs font-medium">{t("previousReplies")}</p>
                    {replyTarget.replies?.map((reply) => (
                      <div key={reply.id} className="rounded-md bg-background/80 px-2 py-1.5 text-xs">
                        <span className="font-medium">{reply.authorName}: </span>
                        {reply.content}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="review-reply">{t("replyLabel")}</Label>
                <Textarea
                  id="review-reply"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={4}
                  placeholder={t("replyPlaceholder")}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setReplyTarget(null);
                setReplyText("");
              }}
            >
              {tc("cancel")}
            </Button>
            <Button
              disabled={!replyText.trim() || replyMutation.isPending}
              onClick={() =>
                replyTarget &&
                replyMutation.mutate({ id: replyTarget.id, content: replyText.trim() })
              }
            >
              {t("sendReply")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
