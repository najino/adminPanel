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
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSeoSettings, updateSeoSettings, uploadFile } from "@/services/data.service";

const schema = z.object({
  siteTitle: z.string(),
  metaDescription: z.string(),
  metaKeywords: z.string(),
  canonicalUrl: z.string(),
  ogTitle: z.string(),
  ogDescription: z.string(),
  ogImageUrl: z.string(),
  googleAnalyticsId: z.string(),
  gtmId: z.string(),
  facebookPixelId: z.string(),
  hreflangEn: z.string(),
  hreflangFa: z.string(),
  jsonLdFile: z.string().optional(),
  sitemapFile: z.string().optional(),
  robotsFile: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function SeoSettingsPage() {
  const t = useTranslations("pages.seo");
  const tp = useTranslations("pages");
  const tc = useTranslations("common");
  const queryClient = useQueryClient();

  const { data: settings } = useQuery({
    queryKey: ["seo-settings"],
    queryFn: getSeoSettings,
  });

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      siteTitle: "",
      metaDescription: "",
      metaKeywords: "",
      canonicalUrl: "",
      ogTitle: "",
      ogDescription: "",
      ogImageUrl: "",
      googleAnalyticsId: "",
      gtmId: "",
      facebookPixelId: "",
      hreflangEn: "",
      hreflangFa: "",
    },
  });

  useEffect(() => {
    if (settings) form.reset(settings);
  }, [settings, form]);

  const mutation = useMutation({
    mutationFn: (payload: FormData) => updateSeoSettings(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seo-settings"] });
      toast.success(t("header.saved"));
    },
    onError: () => toast.error(tc("saveFailed")),
  });

  const handleFileUpload = async (field: "jsonLdFile" | "sitemapFile" | "robotsFile", files: File[]) => {
    const file = files[0];
    if (!file) return;
    const { url } = await uploadFile(file);
    form.setValue(field, url);
  };

  return (
    <PageTransition>
      <PageHeader
        title={tp("titles.seoSettings")}
        description={t("header.subtitle")}
        action={
          <Button onClick={form.handleSubmit((v) => mutation.mutate(v))} disabled={mutation.isPending}>
            {t("header.saveChanges")}
          </Button>
        }
      />

      <form onSubmit={form.handleSubmit((v) => mutation.mutate(v))} className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("general.title")}</CardTitle>
            <CardDescription>{t("general.description")}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex flex-col gap-2">
              <Label>{t("general.siteTitle")}</Label>
              <Input {...form.register("siteTitle")} placeholder={t("general.siteTitlePlaceholder")} />
            </div>
            <div className="flex flex-col gap-2">
              <Label>{t("general.metaDescription")}</Label>
              <Textarea {...form.register("metaDescription")} placeholder={t("general.metaDescriptionPlaceholder")} />
            </div>
            <div className="flex flex-col gap-2">
              <Label>{t("general.metaKeywords")}</Label>
              <Input {...form.register("metaKeywords")} placeholder={t("general.metaKeywordsPlaceholder")} />
            </div>
            <div className="flex flex-col gap-2">
              <Label>{t("general.canonicalUrl")}</Label>
              <Input {...form.register("canonicalUrl")} placeholder={t("general.canonicalUrlPlaceholder")} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("openGraph.title")}</CardTitle>
            <CardDescription>{t("openGraph.description")}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label>{t("openGraph.ogTitle")}</Label>
              <Input {...form.register("ogTitle")} placeholder={t("openGraph.ogTitlePlaceholder")} />
            </div>
            <div className="flex flex-col gap-2">
              <Label>{t("openGraph.ogImageUrl")}</Label>
              <Input {...form.register("ogImageUrl")} placeholder={t("openGraph.ogImagePlaceholder")} />
            </div>
            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label>{t("openGraph.ogDescription")}</Label>
              <Textarea {...form.register("ogDescription")} placeholder={t("openGraph.ogDescriptionPlaceholder")} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("analytics.title")}</CardTitle>
            <CardDescription>{t("analytics.description")}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label>{t("analytics.gaId")}</Label>
              <Input {...form.register("googleAnalyticsId")} placeholder={t("analytics.gaIdPlaceholder")} />
            </div>
            <div className="flex flex-col gap-2">
              <Label>{t("analytics.gtmId")}</Label>
              <Input {...form.register("gtmId")} placeholder={t("analytics.gtmIdPlaceholder")} />
            </div>
            <div className="flex flex-col gap-2">
              <Label>{t("analytics.fbPixel")}</Label>
              <Input {...form.register("facebookPixelId")} placeholder={t("analytics.fbPixelPlaceholder")} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("performance.hreflang")}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label>hreflang EN</Label>
              <Input {...form.register("hreflangEn")} placeholder="https://example.com/en" />
            </div>
            <div className="flex flex-col gap-2">
              <Label>hreflang FA</Label>
              <Input {...form.register("hreflangFa")} placeholder="https://example.com/fa" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("schema.title")}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-2">
              <Label>JSON-LD</Label>
              <FileDropzone onDrop={(f) => handleFileUpload("jsonLdFile", f)} accept={{ "application/json": [".json"] }} label="Upload JSON-LD" />
            </div>
            <div className="flex flex-col gap-2">
              <Label>{t("sitemap.title")}</Label>
              <FileDropzone onDrop={(f) => handleFileUpload("sitemapFile", f)} accept={{ "application/xml": [".xml"] }} label="Upload Sitemap" />
            </div>
            <div className="flex flex-col gap-2">
              <Label>{t("robots.title")}</Label>
              <FileDropzone onDrop={(f) => handleFileUpload("robotsFile", f)} accept={{ "text/plain": [".txt"] }} label="Upload robots.txt" />
            </div>
          </CardContent>
        </Card>

        <Button type="submit" disabled={mutation.isPending}>
          {t("header.saveChanges")}
        </Button>
      </form>
    </PageTransition>
  );
}
