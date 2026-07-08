"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useContextSection } from "@/hooks/use-context-section";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/shared/page-elements";
import { PageTransition } from "@/components/shared/page-transition";
import { FileDropzone } from "@/components/shared/file-dropzone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { updateContextSection, uploadFile } from "@/services/data.service";

interface Brand {
  id: string;
  title: string;
  description: string;
  logo?: string;
}

export default function BrandsPage() {
  const t = useTranslations("context.brands");
  const tp = useTranslations("pages");
  const tc = useTranslations("common");
  const queryClient = useQueryClient();
  const { state: brands, setState: setBrands } = useContextSection<Brand[]>("brands", []);
  const [editing, setEditing] = useState<Brand | null>(null);
  const [open, setOpen] = useState(false);

  const mutation = useMutation({
    mutationFn: () => updateContextSection("brands", brands),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["context", "brands"] });
      toast.success(tc("save"));
    },
  });

  const openAdd = () => {
    setEditing({ id: String(Date.now()), title: "", description: "" });
    setOpen(true);
  };

  const openEdit = (brand: Brand) => {
    setEditing({ ...brand });
    setOpen(true);
  };

  const saveBrand = () => {
    if (!editing) return;
    setBrands((prev) => {
      const exists = prev.find((b) => b.id === editing.id);
      if (exists) return prev.map((b) => (b.id === editing.id ? editing : b));
      return [...prev, editing];
    });
    setOpen(false);
    setEditing(null);
  };

  const deleteBrand = (id: string) => {
    setBrands((prev) => prev.filter((b) => b.id !== id));
  };

  const handleLogoUpload = async (files: File[]) => {
    const file = files[0];
    if (!file || !editing) return;
    const { url } = await uploadFile(file);
    setEditing({ ...editing, logo: url });
  };

  return (
    <PageTransition>
      <PageHeader
        title={tp("titles.brandsSettings")}
        description={t("description")}
        action={
          <Button onClick={openAdd}>
            <Plus className="me-2 h-4 w-4" />
            {t("addBrand")}
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {brands.map((brand) => (
          <Card key={brand.id}>
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle>{brand.title}</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{brand.description}</p>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => openEdit(brand)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => deleteBrand(brand.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {brand.logo ? (
                <img src={brand.logo} alt={brand.title} className="h-20 w-full rounded-lg object-contain" />
              ) : (
                <div className="flex h-20 items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">
                  {t("uploadImage")}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-4">
        <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
          {t("save")}
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing?.title ? tc("edit") : t("addBrand")}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t("brandTitle")}</Label>
                <Input
                  value={editing.title}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                  placeholder={t("brandTitlePlaceholder")}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("brandDescription")}</Label>
                <Textarea
                  value={editing.description}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  placeholder={t("brandDescriptionPlaceholder")}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("images")}</Label>
                {editing.logo && (
                  <img src={editing.logo} alt="" className="mb-2 h-16 rounded object-contain" />
                )}
                <FileDropzone onDrop={handleLogoUpload} accept={{ "image/*": [] }} label={t("uploadImage")} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              {tc("cancel")}
            </Button>
            <Button onClick={saveBrand}>{tc("save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageTransition>
  );
}
