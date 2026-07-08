"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-elements";
import { PageTransition } from "@/components/shared/page-transition";
import { FileDropzone } from "@/components/shared/file-dropzone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getGeneralSettings, updateGeneralSettings, uploadFile } from "@/services/data.service";

const schema = z.object({
  storeName: z.string().min(1),
  logo: z.string().optional(),
  favicon: z.string().optional(),
  contactEmail: z.string().email(),
  contactPhone: z.string(),
  facebook: z.string().optional(),
  twitter: z.string().optional(),
  instagram: z.string().optional(),
  youtube: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function GeneralSettingPage() {
  const t = useTranslations("generalSetting");
  const tp = useTranslations("pages");
  const tc = useTranslations("common");
  const queryClient = useQueryClient();

  const { data: settings } = useQuery({
    queryKey: ["general-settings"],
    queryFn: getGeneralSettings,
  });

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      storeName: "",
      contactEmail: "",
      contactPhone: "",
    },
  });

  useEffect(() => {
    if (settings) form.reset(settings);
  }, [settings, form]);

  const mutation = useMutation({
    mutationFn: (payload: FormData) => updateGeneralSettings(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["general-settings"] });
      toast.success(tc("save"));
    },
  });

  const handleUpload = async (field: "logo" | "favicon", files: File[]) => {
    const file = files[0];
    if (!file) return;
    const { url } = await uploadFile(file);
    form.setValue(field, url);
  };

  return (
    <PageTransition>
      <PageHeader title={tp("titles.baseInformation")} />
      <form onSubmit={form.handleSubmit((v) => mutation.mutate(v))} className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("siteInformation.title")}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label>{t("siteInformation.siteName")}</Label>
              <Input {...form.register("storeName")} placeholder={t("siteInformation.siteNamePlaceholder")} />
            </div>
            <div className="flex flex-col gap-2">
              <Label>{t("siteInformation.logo")}</Label>
              {form.watch("logo") && (
                <img src={form.watch("logo")} alt="" className="mb-2 h-16 object-contain" />
              )}
              <FileDropzone onDrop={(f) => handleUpload("logo", f)} accept={{ "image/*": [] }} label={t("siteInformation.uploadLogo")} />
            </div>
            <div className="flex flex-col gap-2">
              <Label>{t("siteInformation.favicon")}</Label>
              {form.watch("favicon") && (
                <img src={form.watch("favicon")} alt="" className="mb-2 h-8 object-contain" />
              )}
              <FileDropzone onDrop={(f) => handleUpload("favicon", f)} accept={{ "image/*": [] }} label={t("siteInformation.uploadFavicon")} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("contactInformation.title")}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label>{t("contactInformation.email")}</Label>
              <Input {...form.register("contactEmail")} placeholder={t("contactInformation.emailPlaceholder")} />
            </div>
            <div className="flex flex-col gap-2">
              <Label>{t("contactInformation.phone")}</Label>
              <Input {...form.register("contactPhone")} placeholder={t("contactInformation.phonePlaceholder")} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("socialMedia.title")}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label>{t("socialMedia.facebook")}</Label>
              <Input {...form.register("facebook")} placeholder={t("socialMedia.facebookPlaceholder")} />
            </div>
            <div className="flex flex-col gap-2">
              <Label>{t("socialMedia.twitter")}</Label>
              <Input {...form.register("twitter")} placeholder={t("socialMedia.twitterPlaceholder")} />
            </div>
            <div className="flex flex-col gap-2">
              <Label>{t("socialMedia.instagram")}</Label>
              <Input {...form.register("instagram")} placeholder={t("socialMedia.instagramPlaceholder")} />
            </div>
            <div className="flex flex-col gap-2">
              <Label>{t("socialMedia.youtube")}</Label>
              <Input {...form.register("youtube")} placeholder={t("socialMedia.youtubePlaceholder")} />
            </div>
          </CardContent>
        </Card>

        <Button type="submit" disabled={mutation.isPending}>
          {t("siteInformation.saveSiteInfo")}
        </Button>
      </form>
    </PageTransition>
  );
}
