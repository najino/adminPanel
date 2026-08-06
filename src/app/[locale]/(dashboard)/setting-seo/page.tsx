"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  getSeoSettings,
  updateSeoSettings,
  uploadFile,
} from "@/services/data.service";
import { isPlaceholderSeoUrl, isValidHttpUrl } from "@/lib/seo/metadata";

function validateJsonLd(raw: string): boolean {
  if (!raw.trim()) return true;
  try {
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed !== null;
  } catch {
    return false;
  }
}

function optionalHttpUrl(messageInvalid: string, messagePlaceholder: string) {
  return z
    .string()
    .refine((v) => isValidHttpUrl(v), { message: messageInvalid })
    .refine((v) => !isPlaceholderSeoUrl(v), { message: messagePlaceholder });
}

export default function SeoSettingsPage() {
  const t = useTranslations("pages.seo");
  const tp = useTranslations("pages");
  const tc = useTranslations("common");
  const queryClient = useQueryClient();

  const urlInvalid = t("validation.invalidUrl");
  const urlPlaceholder = t("validation.placeholderUrl");

  const schema = z.object({
    siteTitle: z.string(),
    metaDescription: z.string(),
    metaKeywords: z.string(),
    canonicalUrl: optionalHttpUrl(urlInvalid, urlPlaceholder),
    ogTitle: z.string(),
    ogDescription: z.string(),
    ogImageUrl: optionalHttpUrl(urlInvalid, urlPlaceholder),
    robotsIndex: z.boolean(),
    robotsFollow: z.boolean(),
    robotsMaxImagePreview: z.enum(["none", "standard", "large"]),
    twitterCard: z.enum(["summary", "summary_large_image"]),
    twitterTitle: z.string(),
    twitterDescription: z.string(),
    twitterImageUrl: optionalHttpUrl(urlInvalid, urlPlaceholder),
    googleAnalyticsId: z.string(),
    gtmId: z.string(),
    facebookPixelId: z.string(),
    hreflangEn: optionalHttpUrl(urlInvalid, urlPlaceholder),
    hreflangFa: optionalHttpUrl(urlInvalid, urlPlaceholder),
    hreflangXDefault: optionalHttpUrl(urlInvalid, urlPlaceholder),
    customJsonLd: z
      .string()
      .optional()
      .refine((value) => validateJsonLd(value ?? ""), {
        message: "Invalid JSON-LD",
      }),
    sitemapFile: z.string().optional(),
    robotsFile: z.string().optional(),
  });

  type FormData = z.infer<typeof schema>;

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
      robotsIndex: true,
      robotsFollow: true,
      robotsMaxImagePreview: "large",
      twitterCard: "summary_large_image",
      twitterTitle: "",
      twitterDescription: "",
      twitterImageUrl: "",
      googleAnalyticsId: "",
      gtmId: "",
      facebookPixelId: "",
      hreflangEn: "",
      hreflangFa: "",
      hreflangXDefault: "",
      customJsonLd: "",
    },
  });

  useEffect(() => {
    if (settings) {
      form.reset({
        ...settings,
        customJsonLd: settings.customJsonLd ?? "",
      });
    }
  }, [settings, form]);

  const mutation = useMutation({
    mutationFn: (payload: FormData) => updateSeoSettings(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seo-settings"] });
      toast.success(t("header.saved"));
    },
    onError: () => toast.error(tc("saveFailed")),
  });

  const handleJsonLdUpload = async (files: File[]) => {
    const file = files[0];
    if (!file) return;
    try {
      const text = await file.text();
      if (!validateJsonLd(text)) {
        toast.error(t("schema.invalidJson"));
        return;
      }
      form.setValue("customJsonLd", text.trim(), { shouldValidate: true });
      toast.success(t("schema.imported"));
    } catch {
      toast.error(t("schema.invalidJson"));
    }
  };

  const handleFileUpload = async (
    field: "sitemapFile" | "robotsFile",
    files: File[],
  ) => {
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
          <Button
            onClick={form.handleSubmit((v) => mutation.mutate(v))}
            disabled={mutation.isPending}
          >
            {t("header.saveChanges")}
          </Button>
        }
      />

      <form
        onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
        className="flex flex-col gap-6"
      >
        <Card>
          <CardHeader>
            <CardTitle>{t("general.title")}</CardTitle>
            <CardDescription>{t("general.description")}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex flex-col gap-2">
              <Label>{t("general.siteTitle")}</Label>
              <Input
                {...form.register("siteTitle")}
                placeholder={t("general.siteTitlePlaceholder")}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>{t("general.metaDescription")}</Label>
              <Textarea
                {...form.register("metaDescription")}
                placeholder={t("general.metaDescriptionPlaceholder")}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>{t("general.metaKeywords")}</Label>
              <Input
                {...form.register("metaKeywords")}
                placeholder={t("general.metaKeywordsPlaceholder")}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>{t("general.canonicalUrl")}</Label>
              <Input
                {...form.register("canonicalUrl")}
                placeholder={t("general.canonicalUrlPlaceholder")}
              />
              {form.formState.errors.canonicalUrl && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.canonicalUrl.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground">{t("general.canonicalUrlHint")}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("indexing.title")}</CardTitle>
            <CardDescription>{t("indexing.description")}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1">
                <Label htmlFor="robots-index">{t("indexing.allowIndexing")}</Label>
                <p className="text-xs text-muted-foreground">{t("indexing.allowIndexingHint")}</p>
              </div>
              <Controller
                control={form.control}
                name="robotsIndex"
                render={({ field }) => (
                  <Switch
                    id="robots-index"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1">
                <Label htmlFor="robots-follow">{t("indexing.followLinks")}</Label>
                <p className="text-xs text-muted-foreground">{t("indexing.followLinksHint")}</p>
              </div>
              <Controller
                control={form.control}
                name="robotsFollow"
                render={({ field }) => (
                  <Switch
                    id="robots-follow"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>{t("indexing.maxImagePreview")}</Label>
              <Controller
                control={form.control}
                name="robotsMaxImagePreview"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full max-w-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">
                        {t("indexing.maxImagePreviewOptions.none")}
                      </SelectItem>
                      <SelectItem value="standard">
                        {t("indexing.maxImagePreviewOptions.standard")}
                      </SelectItem>
                      <SelectItem value="large">
                        {t("indexing.maxImagePreviewOptions.large")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              <p className="text-xs text-muted-foreground">{t("indexing.maxImagePreviewHint")}</p>
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
              <Input
                {...form.register("ogTitle")}
                placeholder={t("openGraph.ogTitlePlaceholder")}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>{t("openGraph.ogImageUrl")}</Label>
              <Input
                {...form.register("ogImageUrl")}
                placeholder={t("openGraph.ogImagePlaceholder")}
              />
              {form.formState.errors.ogImageUrl && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.ogImageUrl.message}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label>{t("openGraph.ogDescription")}</Label>
              <Textarea
                {...form.register("ogDescription")}
                placeholder={t("openGraph.ogDescriptionPlaceholder")}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("twitter.title")}</CardTitle>
            <CardDescription>{t("twitter.description")}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label>{t("twitter.card")}</Label>
              <Controller
                control={form.control}
                name="twitterCard"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full max-w-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="summary">{t("twitter.cards.summary")}</SelectItem>
                      <SelectItem value="summary_large_image">
                        {t("twitter.cards.summary_large_image")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              <p className="text-xs text-muted-foreground">{t("twitter.cardHint")}</p>
            </div>
            <div className="flex flex-col gap-2">
              <Label>{t("twitter.titleLabel")}</Label>
              <Input
                {...form.register("twitterTitle")}
                placeholder={t("twitter.titlePlaceholder")}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>{t("twitter.imageUrl")}</Label>
              <Input
                {...form.register("twitterImageUrl")}
                placeholder={t("twitter.imagePlaceholder")}
              />
              {form.formState.errors.twitterImageUrl && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.twitterImageUrl.message}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label>{t("twitter.descriptionLabel")}</Label>
              <Textarea
                {...form.register("twitterDescription")}
                placeholder={t("twitter.descriptionPlaceholder")}
              />
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
              <Input
                {...form.register("googleAnalyticsId")}
                placeholder={t("analytics.gaIdPlaceholder")}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>{t("analytics.gtmId")}</Label>
              <Input
                {...form.register("gtmId")}
                placeholder={t("analytics.gtmIdPlaceholder")}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>{t("analytics.fbPixel")}</Label>
              <Input
                {...form.register("facebookPixelId")}
                placeholder={t("analytics.fbPixelPlaceholder")}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("hreflang.title")}</CardTitle>
            <CardDescription>{t("hreflang.description")}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label>{t("hreflang.en")}</Label>
              <Input
                {...form.register("hreflangEn")}
                placeholder={t("hreflang.urlPlaceholder")}
              />
              {form.formState.errors.hreflangEn && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.hreflangEn.message}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label>{t("hreflang.fa")}</Label>
              <Input
                {...form.register("hreflangFa")}
                placeholder={t("hreflang.urlPlaceholder")}
              />
              {form.formState.errors.hreflangFa && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.hreflangFa.message}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label>{t("hreflang.xDefault")}</Label>
              <Input
                {...form.register("hreflangXDefault")}
                placeholder={t("hreflang.urlPlaceholder")}
              />
              {form.formState.errors.hreflangXDefault && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.hreflangXDefault.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground">{t("hreflang.xDefaultHint")}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("schema.title")}</CardTitle>
            <CardDescription>{t("schema.description")}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <p className="text-sm text-muted-foreground">{t("schema.autoHint")}</p>
            <div className="flex flex-col gap-2">
              <Label>{t("schema.customJsonLd")}</Label>
              <Textarea
                {...form.register("customJsonLd")}
                placeholder={t("schema.customJsonLdPlaceholder")}
                className="min-h-[160px] font-mono text-xs"
                spellCheck={false}
              />
              {form.formState.errors.customJsonLd && (
                <p className="text-sm text-destructive">{t("schema.invalidJson")}</p>
              )}
              <p className="text-xs text-muted-foreground">{t("schema.customJsonLdHint")}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="flex flex-col gap-2">
                <Label>{t("schema.importFile")}</Label>
                <FileDropzone
                  onDrop={handleJsonLdUpload}
                  accept={{ "application/json": [".json"] }}
                  label={t("schema.importFile")}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>{t("sitemap.title")}</Label>
                <FileDropzone
                  onDrop={(f) => handleFileUpload("sitemapFile", f)}
                  accept={{ "application/xml": [".xml"] }}
                  label={t("sitemap.title")}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>{t("robots.title")}</Label>
                <FileDropzone
                  onDrop={(f) => handleFileUpload("robotsFile", f)}
                  accept={{ "text/plain": [".txt"] }}
                  label={t("robots.title")}
                />
              </div>
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
