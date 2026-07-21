"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { ColumnDef } from "@tanstack/react-table";
import { ImageIcon, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageTransition } from "@/components/shared/page-transition";
import { PageHeader, StatusBadge } from "@/components/shared/page-elements";
import { FormField } from "@/components/shared/form-field";
import { FileDropzone } from "@/components/shared/file-dropzone";
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
import { uploadFile } from "@/services/data.service";
import { slugify } from "@/lib/utils";
import type { AdminBrand } from "@/types/api/products";

interface BrandFormState {
  name: string;
  slug: string;
  description: string;
  logo_url: string;
  is_active: boolean;
}

const emptyForm = (): BrandFormState => ({
  name: "",
  slug: "",
  description: "",
  logo_url: "",
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
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState<BrandFormState>(emptyForm);

  const { data: brands = [], isLoading } = useQuery({
    queryKey: ["admin-brands"],
    queryFn: getAdminBrands,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin-brands"] });

  const upsertBrandInCache = (brand: AdminBrand) => {
    queryClient.setQueryData<AdminBrand[]>(["admin-brands"], (prev) => {
      const list = prev ?? [];
      const idx = list.findIndex((b) => b.id === brand.id);
      if (idx === -1) return [brand, ...list];
      const next = [...list];
      next[idx] = {
        ...next[idx],
        ...brand,
        logo_url: brand.logo_url || next[idx].logo_url,
      };
      return next;
    });
  };

  const createMutation = useMutation({
    mutationFn: createAdminBrand,
    onSuccess: (brand) => {
      upsertBrandInCache(brand);
      closeDialog();
      toast.success(t("created"));
    },
    onError: () => toast.error(t("saveFailed")),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof updateAdminBrand>[1] }) =>
      updateAdminBrand(id, payload),
    onSuccess: (brand) => {
      upsertBrandInCache(brand);
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
    setUploading(false);
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
      logo_url: brand.logo_url ?? "",
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

  const handleLogoUpload = async (files: File[]) => {
    const file = files[0];
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await uploadFile(file);
      setForm((prev) => ({ ...prev, logo_url: url }));
    } catch {
      toast.error(t("saveFailed"));
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = () => {
    const name = form.name.trim();
    if (!name) return;

    const logo_url = form.logo_url.trim();

    if (editingId) {
      updateMutation.mutate({
        id: editingId,
        payload: {
          name,
          slug: form.slug.trim() || slugify(name),
          description: form.description.trim() || undefined,
          logo_url,
          is_active: form.is_active,
        },
      });
      return;
    }

    createMutation.mutate({
      name,
      slug: form.slug.trim() || slugify(name),
      description: form.description.trim() || undefined,
      logo_url: logo_url || undefined,
      is_active: form.is_active,
    });
  };

  const columns: ColumnDef<AdminBrand>[] = [
    {
      id: "logo",
      header: t("columns.logo"),
      cell: ({ row }) =>
        row.original.logo_url ? (
          <img
            src={row.original.logo_url}
            alt=""
            className="size-10 rounded-xl object-contain ring-1 ring-border bg-muted/40"
          />
        ) : (
          <div className="flex size-10 items-center justify-center rounded-xl bg-muted/50 text-muted-foreground">
            <ImageIcon className="size-4" aria-hidden />
          </div>
        ),
    },
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

  const isPending = createMutation.isPending || updateMutation.isPending || uploading;

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
            <FormField label={t("form.logo")} helper={t("form.logoHint")}>
              {form.logo_url ? (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-center rounded-2xl border border-border/70 bg-muted/30 p-4">
                    <img
                      src={form.logo_url}
                      alt=""
                      className="max-h-28 max-w-full rounded-xl object-contain"
                    />
                  </div>
                  <div className="flex gap-2">
                    <FileDropzone
                      onDrop={handleLogoUpload}
                      accept={{ "image/*": [".png", ".jpg", ".jpeg", ".webp"] }}
                      label={t("form.uploadLogo")}
                      className="flex-1 p-4"
                      disabled={uploading}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="shrink-0"
                      onClick={() => setForm((prev) => ({ ...prev, logo_url: "" }))}
                    >
                      {t("form.removeLogo")}
                    </Button>
                  </div>
                </div>
              ) : (
                <FileDropzone
                  onDrop={handleLogoUpload}
                  accept={{ "image/*": [".png", ".jpg", ".jpeg", ".webp"] }}
                  label={uploading ? tCommon("loading") : t("form.uploadLogo")}
                  className="rounded-2xl p-6"
                  disabled={uploading}
                />
              )}
            </FormField>

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
