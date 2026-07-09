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
import { FormField } from "@/components/shared/form-field";
import { FileDropzone } from "@/components/shared/file-dropzone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { uploadFile } from "@/services/data.service";
import { getHero, updateHero } from "@/services/storefront.service";

const schema = z.object({
  title: z.string().min(1),
  subtitle: z.string(),
  cta_primary_text: z.string(),
  cta_primary_url: z.string(),
  cta_secondary_text: z.string(),
  cta_secondary_url: z.string(),
  video_url: z.string().optional(),
  is_active: z.boolean(),
});

type FormData = z.infer<typeof schema>;

export default function HeroSettingsPage() {
  const t = useTranslations("context.hero");
  const tp = useTranslations("pages");
  const tc = useTranslations("common");
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["hero"],
    queryFn: getHero,
  });

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      subtitle: "",
      cta_primary_text: "",
      cta_primary_url: "",
      cta_secondary_text: "",
      cta_secondary_url: "",
      video_url: "",
      is_active: true,
    },
  });

  useEffect(() => {
    if (data) {
      form.reset({
        title: data.title ?? "",
        subtitle: data.subtitle ?? "",
        cta_primary_text: data.cta_primary_text ?? "",
        cta_primary_url: data.cta_primary_url ?? "",
        cta_secondary_text: data.cta_secondary_text ?? "",
        cta_secondary_url: data.cta_secondary_url ?? "",
        video_url: data.video_url ?? "",
        is_active: data.is_active ?? true,
      });
    }
  }, [data, form]);

  const mutation = useMutation({
    mutationFn: updateHero,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hero"] });
      toast.success(t("saved"));
    },
    onError: () => toast.error(t("saveFailed")),
  });

  const handleVideoUpload = async (files: File[]) => {
    const file = files[0];
    if (!file) return;
    const { url } = await uploadFile(file);
    form.setValue("video_url", url);
  };

  return (
    <PageTransition>
      <PageHeader title={tp("titles.heroSettings")} description={t("videoHint")} />
      <form onSubmit={form.handleSubmit((v) => mutation.mutate(v))}>
        <Card>
          <CardHeader>
            <CardTitle>{t("title")}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            {isLoading ? (
              <p className="text-sm text-muted-foreground">{tc("loading")}</p>
            ) : (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField label={t("headline")} htmlFor="hero-title" required>
                    <Input id="hero-title" {...form.register("title")} placeholder={t("buttonNamePlaceholder")} />
                  </FormField>
                  <FormField label={t("subtitle")} htmlFor="hero-subtitle">
                    <Input id="hero-subtitle" {...form.register("subtitle")} placeholder={t("buttonNamePlaceholder")} />
                  </FormField>
                  <FormField label={t("button1")} htmlFor="cta-primary-text">
                    <Input id="cta-primary-text" {...form.register("cta_primary_text")} placeholder={t("buttonNamePlaceholder")} />
                  </FormField>
                  <FormField label={t("buttonLink")} htmlFor="cta-primary-url">
                    <Input id="cta-primary-url" {...form.register("cta_primary_url")} placeholder={t("buttonLinkPlaceholder")} />
                  </FormField>
                  <FormField label={t("button2")} htmlFor="cta-secondary-text">
                    <Input id="cta-secondary-text" {...form.register("cta_secondary_text")} placeholder={t("buttonNamePlaceholder")} />
                  </FormField>
                  <FormField label={t("button2Link")} htmlFor="cta-secondary-url">
                    <Input id="cta-secondary-url" {...form.register("cta_secondary_url")} placeholder={t("buttonLinkPlaceholder")} />
                  </FormField>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-sm font-medium">{t("uploadVideo")}</span>
                  {form.watch("video_url") ? (
                    <video
                      src={form.watch("video_url")}
                      className="mb-2 h-32 w-full rounded-lg object-cover"
                      controls
                    />
                  ) : null}
                  <FileDropzone
                    onDrop={handleVideoUpload}
                    accept={{ "video/*": [] }}
                    label={t("uploadVideo")}
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div>
                    <p className="font-medium">{t("activeLabel")}</p>
                    <p className="text-sm text-muted-foreground">{t("videoHint")}</p>
                  </div>
                  <Switch
                    checked={form.watch("is_active")}
                    onCheckedChange={(v) => form.setValue("is_active", v)}
                  />
                </div>

                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending ? tc("loading") : t("save")}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </form>
    </PageTransition>
  );
}
