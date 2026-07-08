"use client";

import { useContextSection } from "@/hooks/use-context-section";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { PageHeader, EmptyState } from "@/components/shared/page-elements";
import { PageTransition } from "@/components/shared/page-transition";
import { FileDropzone } from "@/components/shared/file-dropzone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateContextSection, uploadFile } from "@/services/data.service";

interface Banner {
  id: string;
  link: string;
  desktopImage?: string;
  mobileImage?: string;
}

export default function ProBannersPage() {
  const t = useTranslations("context.proBanners");
  const tp = useTranslations("pages");
  const tc = useTranslations("common");
  const queryClient = useQueryClient();
  const { state: banners, setState: setBanners } = useContextSection<Banner[]>("pro-banners", []);

  const mutation = useMutation({
    mutationFn: () => updateContextSection("pro-banners", banners),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["context", "pro-banners"] });
      toast.success(tc("save"));
    },
  });

  const addBanner = () => {
    setBanners((prev) => [...prev, { id: String(Date.now()), link: "" }]);
  };

  const removeBanner = (id: string) => {
    setBanners((prev) => prev.filter((b) => b.id !== id));
  };

  const updateBanner = (id: string, field: keyof Banner, value: string) => {
    setBanners((prev) => prev.map((b) => (b.id === id ? { ...b, [field]: value } : b)));
  };

  const handleUpload = async (id: string, field: "desktopImage" | "mobileImage", files: File[]) => {
    const file = files[0];
    if (!file) return;
    const { url } = await uploadFile(file);
    updateBanner(id, field, url);
  };

  return (
    <PageTransition>
      <PageHeader
        title={tp("titles.proBannersSettings")}
        description={t("description")}
        action={
          <Button onClick={addBanner}>
            <Plus className="me-2 h-4 w-4" />
            {t("addBanner")}
          </Button>
        }
      />

      {banners.length === 0 ? (
        <EmptyState title="No banners yet" description={t("description")} />
      ) : (
        <div className="space-y-4">
          {banners.map((banner, index) => (
            <Card key={banner.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>
                  {t("banner")} {index + 1}
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => removeBanner(banner.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>{t("link")}</Label>
                  <Input
                    value={banner.link}
                    onChange={(e) => updateBanner(banner.id, "link", e.target.value)}
                    placeholder={t("linkPlaceholder")}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>{t("desktopImage")}</Label>
                    <FileDropzone
                      onDrop={(files) => handleUpload(banner.id, "desktopImage", files)}
                      accept={{ "image/*": [] }}
                      label={t("uploadDesktop")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("mobileImage")}</Label>
                    <FileDropzone
                      onDrop={(files) => handleUpload(banner.id, "mobileImage", files)}
                      accept={{ "image/*": [] }}
                      label={t("uploadMobile")}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-4">
        <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
          {t("save")}
        </Button>
      </div>
    </PageTransition>
  );
}
