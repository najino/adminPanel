"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { PageHeader, EmptyState } from "@/components/shared/page-elements";
import { PageTransition } from "@/components/shared/page-transition";
import { FormField } from "@/components/shared/form-field";
import { FileDropzone } from "@/components/shared/file-dropzone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  createProBanner,
  deleteProBanner,
  getProBanners,
  isTemporaryId,
  updateProBanner,
} from "@/services/storefront.service";
import type { ProBanner } from "@/types/api/storefront";

interface BannerForm {
  id?: string;
  link_url: string;
  desktop_image_url: string;
  mobile_image_url: string;
}

const emptyForm = (): BannerForm => ({
  link_url: "",
  desktop_image_url: "",
  mobile_image_url: "",
});

export default function ProBannersPage() {
  const t = useTranslations("context.proBanners");
  const tp = useTranslations("pages");
  const tc = useTranslations("common");
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<BannerForm>(emptyForm);

  const { data: banners = [], isLoading } = useQuery({
    queryKey: ["pro-banners"],
    queryFn: getProBanners,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["pro-banners"] });

  const createMutation = useMutation({
    mutationFn: createProBanner,
    onSuccess: () => {
      invalidate();
      setOpen(false);
      setForm(emptyForm());
      toast.success(t("created"));
    },
    onError: () => toast.error(t("saveFailed")),
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Parameters<typeof updateProBanner>[1];
    }) => updateProBanner(id, payload),
    onSuccess: () => {
      invalidate();
      setOpen(false);
      setForm(emptyForm());
      toast.success(t("updated"));
    },
    onError: () => toast.error(t("saveFailed")),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProBanner,
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

  const openEdit = (banner: ProBanner) => {
    setForm({
      id: banner.id,
      link_url: banner.link_url ?? "",
      desktop_image_url: banner.desktop_image_url,
      mobile_image_url: banner.mobile_image_url ?? "",
    });
    setOpen(true);
  };

  const handleSave = () => {
    const desktop_image_url = form.desktop_image_url.trim();
    if (!desktop_image_url) return;

    const payload = {
      desktop_image_url,
      mobile_image_url: form.mobile_image_url.trim() || undefined,
      link_url: form.link_url.trim() || undefined,
      is_active: true,
    };

    if (form.id && !isTemporaryId(form.id)) {
      updateMutation.mutate({ id: form.id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleUpload = async (field: "desktop_image_url" | "mobile_image_url", files: File[]) => {
    const file = files[0];
    if (!file) return;
    const { url } = await uploadFile(file);
    setForm((prev) => ({ ...prev, [field]: url }));
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <PageTransition>
      <PageHeader
        title={tp("titles.proBannersSettings")}
        description={t("description")}
        action={
          <Button onClick={openAdd} className="shadow-elevated-sm">
            <Plus className="me-2 size-4" />
            {t("addBanner")}
          </Button>
        }
      />

      {isLoading ? (
        <p className="text-sm text-muted-foreground">{tc("loading")}</p>
      ) : banners.length === 0 ? (
        <EmptyState title={t("emptyTitle")} description={t("description")} />
      ) : (
        <div className="flex flex-col gap-4">
          {banners.map((banner, index) => (
            <Card key={banner.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>
                  {t("banner")} {index + 1}
                </CardTitle>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(banner)}>
                    <Pencil className="size-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setDeleteId(banner.id)}>
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {banner.link_url ? (
                  <p className="text-sm text-muted-foreground">{banner.link_url}</p>
                ) : null}
                <div className="grid gap-4 sm:grid-cols-2">
                  {banner.desktop_image_url ? (
                    <img src={banner.desktop_image_url} alt="" className="h-24 rounded-lg object-cover" />
                  ) : null}
                  {banner.mobile_image_url ? (
                    <img src={banner.mobile_image_url} alt="" className="h-24 rounded-lg object-cover" />
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{form.id && !isTemporaryId(form.id) ? tc("edit") : t("addBanner")}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <FormField label={t("link")} htmlFor="banner-link">
              <Input
                id="banner-link"
                value={form.link_url}
                onChange={(e) => setForm((p) => ({ ...p, link_url: e.target.value }))}
                placeholder={t("linkPlaceholder")}
              />
            </FormField>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium">{t("desktopImage")} *</span>
                {form.desktop_image_url ? (
                  <img src={form.desktop_image_url} alt="" className="mb-2 h-20 rounded object-cover" />
                ) : null}
                <FileDropzone
                  onDrop={(files) => handleUpload("desktop_image_url", files)}
                  accept={{ "image/*": [] }}
                  label={t("uploadDesktop")}
                />
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium">{t("mobileImage")}</span>
                {form.mobile_image_url ? (
                  <img src={form.mobile_image_url} alt="" className="mb-2 h-20 rounded object-cover" />
                ) : null}
                <FileDropzone
                  onDrop={(files) => handleUpload("mobile_image_url", files)}
                  accept={{ "image/*": [] }}
                  label={t("uploadMobile")}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              {tc("cancel")}
            </Button>
            <Button onClick={handleSave} disabled={!form.desktop_image_url.trim() || isSaving}>
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
