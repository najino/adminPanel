"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/shared/page-elements";
import { PageTransition } from "@/components/shared/page-transition";
import { FormField } from "@/components/shared/form-field";
import { FileDropzone } from "@/components/shared/file-dropzone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { uploadFile } from "@/services/data.service";
import {
  createPartnerBrand,
  deletePartnerBrand,
  getPartnerBrands,
  isTemporaryId,
  partnerBrandToPayload,
  updatePartnerBrand,
} from "@/services/storefront.service";
import type { PartnerBrand } from "@/types/api/storefront";

interface BrandForm {
  id?: string;
  title: string;
  description: string;
  logo_url: string;
  link_url: string;
}

const emptyForm = (): BrandForm => ({
  title: "",
  description: "",
  logo_url: "",
  link_url: "",
});

export default function BrandsPage() {
  const t = useTranslations("context.brands");
  const tp = useTranslations("pages");
  const tc = useTranslations("common");
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<BrandForm>(emptyForm);

  const { data: brands = [], isLoading } = useQuery({
    queryKey: ["partner-brands"],
    queryFn: getPartnerBrands,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["partner-brands"] });

  const createMutation = useMutation({
    mutationFn: createPartnerBrand,
    onSuccess: () => {
      invalidate();
      setOpen(false);
      setForm(emptyForm());
      toast.success(t("created"));
    },
    onError: () => toast.error(t("saveFailed")),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ReturnType<typeof partnerBrandToPayload> }) =>
      updatePartnerBrand(id, payload),
    onSuccess: () => {
      invalidate();
      setOpen(false);
      setForm(emptyForm());
      toast.success(t("updated"));
    },
    onError: () => toast.error(t("saveFailed")),
  });

  const deleteMutation = useMutation({
    mutationFn: deletePartnerBrand,
    onSuccess: () => {
      invalidate();
      setDeleteId(null);
      toast.success(t("deleted"));
    },
    onError: () => toast.error(t("saveFailed")),
  });

  const openAdd = () => {
    setForm(emptyForm());
    setOpen(true);
  };

  const openEdit = (brand: PartnerBrand) => {
    setForm({
      id: brand.id,
      title: brand.title,
      description: brand.description ?? "",
      logo_url: brand.logo_url ?? "",
      link_url: brand.link_url ?? "",
    });
    setOpen(true);
  };

  const handleSave = () => {
    const title = form.title.trim();
    const logo_url = form.logo_url.trim();
    if (!title || !logo_url) return;

    const payload = {
      title,
      logo_url,
      description: form.description.trim() || undefined,
      link_url: form.link_url.trim() || undefined,
      is_active: true,
    };

    if (form.id && !isTemporaryId(form.id)) {
      updateMutation.mutate({ id: form.id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleLogoUpload = async (files: File[]) => {
    const file = files[0];
    if (!file) return;
    const { url } = await uploadFile(file);
    setForm((prev) => ({ ...prev, logo_url: url }));
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <PageTransition>
      <PageHeader
        title={tp("titles.brandsSettings")}
        description={t("description")}
        action={
          <Button onClick={openAdd} className="shadow-elevated-sm">
            <Plus className="me-2 size-4" />
            {t("addBrand")}
          </Button>
        }
      />

      {isLoading ? (
        <p className="text-sm text-muted-foreground">{tc("loading")}</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {brands.map((brand) => (
            <Card key={brand.id}>
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle>{brand.title}</CardTitle>
                  {brand.description ? (
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{brand.description}</p>
                  ) : null}
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(brand)}>
                    <Pencil className="size-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setDeleteId(brand.id)}>
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {brand.logo_url ? (
                  <img src={brand.logo_url} alt={brand.title} className="h-20 w-full rounded-lg object-contain" />
                ) : (
                  <div className="flex h-20 items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">
                    {t("uploadImage")}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{form.id && !isTemporaryId(form.id) ? tc("edit") : t("addBrand")}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <FormField label={t("brandTitle")} htmlFor="brand-title" required>
              <Input
                id="brand-title"
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                placeholder={t("brandTitlePlaceholder")}
              />
            </FormField>
            <FormField label={t("brandDescription")} htmlFor="brand-desc">
              <Textarea
                id="brand-desc"
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                placeholder={t("brandDescriptionPlaceholder")}
              />
            </FormField>
            <FormField label={t("link")} htmlFor="brand-link">
              <Input
                id="brand-link"
                value={form.link_url}
                onChange={(e) => setForm((p) => ({ ...p, link_url: e.target.value }))}
                placeholder={t("linkPlaceholder")}
              />
            </FormField>
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium">{t("images")} *</span>
              {form.logo_url ? (
                <img src={form.logo_url} alt="" className="mb-2 h-16 rounded object-contain" />
              ) : null}
              <FileDropzone onDrop={handleLogoUpload} accept={{ "image/*": [] }} label={t("uploadImage")} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              {tc("cancel")}
            </Button>
            <Button
              onClick={handleSave}
              disabled={!form.title.trim() || !form.logo_url.trim() || isSaving}
            >
              {isSaving ? tc("loading") : tc("save")}
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
