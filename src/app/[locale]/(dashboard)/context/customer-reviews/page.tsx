"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Check, Plus, Trash2, X } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { PageHeader } from "@/components/shared/page-elements";
import { PageTransition } from "@/components/shared/page-transition";
import { FormField } from "@/components/shared/form-field";
import { FileDropzone } from "@/components/shared/file-dropzone";
import { DataTable } from "@/components/tables/data-table";
import { StatusBadge } from "@/components/shared/page-elements";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { uploadFile } from "@/services/data.service";
import {
  createHomepageReview,
  deleteHomepageReview,
  getHomepageReviews,
  reviewToPayload,
  updateHomepageReview,
} from "@/services/storefront.service";
import { formatDate } from "@/lib/utils";
import type { HomepageReview } from "@/types/api/storefront";

interface ReviewForm {
  customer_name: string;
  review_text: string;
  photo_url: string;
  rating: string;
  is_active: boolean;
}

const emptyForm = (): ReviewForm => ({
  customer_name: "",
  review_text: "",
  photo_url: "",
  rating: "5",
  is_active: true,
});

function reviewStatus(review: HomepageReview): "approved" | "rejected" | "pending" {
  if (review.is_active === true) return "approved";
  if (review.is_active === false) return "rejected";
  return "pending";
}

export default function CustomerReviewsPage() {
  const t = useTranslations("context.customerReviews");
  const tp = useTranslations("pages");
  const ts = useTranslations("common.status");
  const tc = useTranslations("common");
  const queryClient = useQueryClient();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<ReviewForm>(emptyForm);

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["homepage-reviews"],
    queryFn: getHomepageReviews,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["homepage-reviews"] });

  const createMutation = useMutation({
    mutationFn: createHomepageReview,
    onSuccess: () => {
      invalidate();
      setDialogOpen(false);
      setForm(emptyForm());
      toast.success(t("created"));
    },
    onError: () => toast.error(t("saveFailed")),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof updateHomepageReview>[1] }) =>
      updateHomepageReview(id, payload),
    onSuccess: () => {
      invalidate();
      toast.success(t("updated"));
    },
    onError: () => toast.error(t("saveFailed")),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteHomepageReview,
    onSuccess: () => {
      invalidate();
      setDeleteId(null);
      toast.success(t("deleted"));
    },
    onError: () => toast.error(t("saveFailed")),
  });

  const setActive = (review: HomepageReview, is_active: boolean) => {
    updateMutation.mutate({
      id: review.id,
      payload: { ...reviewToPayload(review), is_active },
    });
  };

  const handleCreate = () => {
    const customer_name = form.customer_name.trim();
    const review_text = form.review_text.trim();
    if (!customer_name || !review_text) return;

    createMutation.mutate({
      customer_name,
      review_text,
      photo_url: form.photo_url || undefined,
      rating: Number(form.rating) || undefined,
      is_active: form.is_active,
    });
  };

  const handlePhotoUpload = async (files: File[]) => {
    const file = files[0];
    if (!file) return;
    const { url } = await uploadFile(file);
    setForm((prev) => ({ ...prev, photo_url: url }));
  };

  const formatReviewDate = (iso?: string) => {
    if (!iso) return "—";
    return formatDate(iso);
  };

  const columns: ColumnDef<HomepageReview>[] = [
    {
      accessorKey: "customer_name",
      header: t("name"),
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          {row.original.photo_url ? (
            <img
              src={row.original.photo_url}
              alt=""
              className="size-9 rounded-full object-cover"
            />
          ) : (
            <div className="flex size-9 items-center justify-center rounded-full bg-muted text-xs font-medium">
              {row.original.customer_name.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="font-medium">{row.original.customer_name}</span>
        </div>
      ),
    },
    {
      accessorKey: "review_text",
      header: t("text"),
      cell: ({ row }) => <span className="line-clamp-2 max-w-md">{row.original.review_text}</span>,
    },
    {
      accessorKey: "rating",
      header: t("rating"),
      cell: ({ row }) => (row.original.rating ? `${row.original.rating}/5` : "—"),
    },
    {
      accessorKey: "created_at",
      header: t("date"),
      cell: ({ row }) => (
        <span className="text-muted-foreground">{formatReviewDate(row.original.created_at)}</span>
      ),
    },
    {
      id: "status",
      header: tc("table.status"),
      cell: ({ row }) => {
        const status = reviewStatus(row.original);
        return <StatusBadge status={status} label={ts(status)} />;
      },
    },
    {
      id: "actions",
      header: tc("actions"),
      cell: ({ row }) => (
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActive(row.original, true)}
            disabled={updateMutation.isPending}
            aria-label={ts("approved")}
          >
            <Check className="size-4 text-success" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActive(row.original, false)}
            disabled={updateMutation.isPending}
            aria-label={ts("rejected")}
          >
            <X className="size-4 text-destructive" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDeleteId(row.original.id)}
            aria-label={tc("delete")}
          >
            <Trash2 className="size-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <PageTransition>
      <PageHeader
        title={tp("titles.customerReviewsSettings")}
        description={t("description")}
        action={
          <Button onClick={() => setDialogOpen(true)} className="shadow-elevated-sm">
            <Plus className="me-2 size-4" />
            {t("addReview")}
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={reviews}
        isLoading={isLoading}
        searchKey="customer_name"
        searchPlaceholder={t("namePlaceholder")}
        emptyTitle={t("emptyTitle")}
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("addReview")}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <FormField label={t("name")} htmlFor="review-name" required>
              <Input
                id="review-name"
                value={form.customer_name}
                onChange={(e) => setForm((p) => ({ ...p, customer_name: e.target.value }))}
                placeholder={t("namePlaceholder")}
                className="h-10"
                autoFocus
              />
            </FormField>
            <FormField label={t("text")} htmlFor="review-text" required>
              <Textarea
                id="review-text"
                value={form.review_text}
                onChange={(e) => setForm((p) => ({ ...p, review_text: e.target.value }))}
                placeholder={t("textPlaceholder")}
                rows={4}
              />
            </FormField>
            <FormField label={t("rating")} htmlFor="review-rating">
              <Select value={form.rating} onValueChange={(v) => setForm((p) => ({ ...p, rating: v }))}>
                <SelectTrigger id="review-rating" className="h-10 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[5, 4, 3, 2, 1].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n} / 5
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium">{t("photo")}</span>
              {form.photo_url ? (
                <img src={form.photo_url} alt="" className="mb-2 size-16 rounded-full object-cover" />
              ) : null}
              <FileDropzone
                onDrop={handlePhotoUpload}
                accept={{ "image/*": [] }}
                label={t("uploadPhoto")}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border/70 px-3 py-2.5">
              <span className="text-sm font-medium">{t("publishNow")}</span>
              <Switch
                checked={form.is_active}
                onCheckedChange={(checked) => setForm((p) => ({ ...p, is_active: checked }))}
                aria-label={t("publishNow")}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {tc("cancel")}
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!form.customer_name.trim() || !form.review_text.trim() || createMutation.isPending}
            >
              {createMutation.isPending ? tc("loading") : t("createReview")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("deleteDescription")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tc("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
            >
              {tc("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageTransition>
  );
}
