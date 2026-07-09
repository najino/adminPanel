"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { ColumnDef } from "@tanstack/react-table";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageTransition } from "@/components/shared/page-transition";
import { PageHeader, StatusBadge } from "@/components/shared/page-elements";
import { FormField } from "@/components/shared/form-field";
import { DataTable } from "@/components/tables/data-table";
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
  createAdminBrand,
  deleteAdminBrand,
  getAdminBrands,
  updateAdminBrand,
} from "@/services/product.service";
import { slugify } from "@/lib/utils";
import type { AdminBrand } from "@/types/api/products";

interface BrandFormState {
  name: string;
  slug: string;
  description: string;
  is_active: boolean;
}

const emptyForm = (): BrandFormState => ({
  name: "",
  slug: "",
  description: "",
  is_active: true,
});

export default function ProductBrandsPage() {
  const t = useTranslations("products.brandsPage");
  const tCommon = useTranslations("common");
  const queryClient = useQueryClient();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);
  const [form, setForm] = useState<BrandFormState>(emptyForm);

  const { data: brands = [], isLoading } = useQuery({
    queryKey: ["admin-brands"],
    queryFn: getAdminBrands,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin-brands"] });

  const createMutation = useMutation({
    mutationFn: createAdminBrand,
    onSuccess: () => {
      invalidate();
      closeDialog();
      toast.success(t("created"));
    },
    onError: () => toast.error(t("saveFailed")),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof updateAdminBrand>[1] }) =>
      updateAdminBrand(id, payload),
    onSuccess: () => {
      invalidate();
      closeDialog();
      toast.success(t("updated"));
    },
    onError: () => toast.error(t("saveFailed")),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAdminBrand,
    onSuccess: () => {
      invalidate();
      setDeleteId(null);
      toast.success(t("deleted"));
    },
    onError: () => toast.error(t("saveFailed")),
  });

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingId(null);
    setSlugTouched(false);
    setForm(emptyForm());
  };

  const openCreate = () => {
    setEditingId(null);
    setSlugTouched(false);
    setForm(emptyForm());
    setDialogOpen(true);
  };

  const openEdit = (brand: AdminBrand) => {
    setEditingId(brand.id);
    setSlugTouched(true);
    setForm({
      name: brand.name,
      slug: brand.slug ?? "",
      description: brand.description ?? "",
      is_active: brand.is_active !== false,
    });
    setDialogOpen(true);
  };

  const handleNameChange = (name: string) => {
    setForm((prev) => ({
      ...prev,
      name,
      slug: slugTouched ? prev.slug : slugify(name),
    }));
  };

  const handleSubmit = () => {
    const name = form.name.trim();
    if (!name) return;

    const payload = {
      name,
      slug: form.slug.trim() || slugify(name),
      description: form.description.trim() || undefined,
      is_active: form.is_active,
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const columns: ColumnDef<AdminBrand>[] = [
    {
      accessorKey: "name",
      header: t("columns.name"),
      cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
    },
    {
      accessorKey: "slug",
      header: t("columns.slug"),
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">{row.original.slug ?? "—"}</span>
      ),
    },
    {
      accessorKey: "description",
      header: t("columns.description"),
      cell: ({ row }) => (
        <span className="line-clamp-1 text-muted-foreground">{row.original.description || "—"}</span>
      ),
    },
    {
      accessorKey: "is_active",
      header: t("columns.status"),
      cell: ({ row }) => (
        <StatusBadge
          status={row.original.is_active !== false ? "active" : "inactive"}
          label={row.original.is_active !== false ? tCommon("status.active") : tCommon("status.inactive")}
        />
      ),
    },
    {
      id: "actions",
      header: t("columns.actions"),
      cell: ({ row }) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={() => openEdit(row.original)}>
            <Pencil className="size-4" />
            <span className="sr-only">{tCommon("edit")}</span>
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setDeleteId(row.original.id)}>
            <Trash2 className="size-4 text-destructive" />
            <span className="sr-only">{tCommon("delete")}</span>
          </Button>
        </div>
      ),
    },
  ];

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <PageTransition>
      <PageHeader
        title={t("pageTitle")}
        description={t("pageDescription")}
        action={
          <Button onClick={openCreate} className="shadow-elevated-sm">
            <Plus className="me-2 size-4" />
            {t("addBrand")}
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={brands}
        isLoading={isLoading}
        searchKey="name"
        searchPlaceholder={t("searchPlaceholder")}
        emptyTitle={t("emptyTitle")}
      />

      <Dialog open={dialogOpen} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? t("editBrand") : t("addBrand")}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <FormField label={t("form.name")} htmlFor="brand-name" required>
              <Input
                id="brand-name"
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder={t("form.namePlaceholder")}
                className="h-10"
                autoFocus
              />
            </FormField>
            <FormField label={t("form.slug")} htmlFor="brand-slug" helper={t("form.slugHelper")}>
              <Input
                id="brand-slug"
                value={form.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setForm((prev) => ({ ...prev, slug: e.target.value }));
                }}
                placeholder="apple"
                className="h-10 font-mono text-sm"
              />
            </FormField>
            <FormField label={t("form.description")} htmlFor="brand-description">
              <Textarea
                id="brand-description"
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder={t("form.descriptionPlaceholder")}
                rows={3}
              />
            </FormField>
            <div className="flex items-center justify-between rounded-lg border border-border/70 px-3 py-2.5">
              <span className="text-sm font-medium">{t("form.active")}</span>
              <Switch
                checked={form.is_active}
                onCheckedChange={(checked) => setForm((prev) => ({ ...prev, is_active: checked }))}
                aria-label={t("form.active")}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              {tCommon("cancel")}
            </Button>
            <Button onClick={handleSubmit} disabled={!form.name.trim() || isPending}>
              {isPending ? tCommon("loading") : editingId ? tCommon("save") : t("createBrand")}
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
            <AlertDialogCancel>{tCommon("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
            >
              {tCommon("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageTransition>
  );
}
