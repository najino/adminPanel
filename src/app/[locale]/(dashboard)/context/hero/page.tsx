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
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getContextSection, updateContextSection, uploadFile } from "@/services/data.service";

const schema = z.object({
  headline: z.string().min(1),
  subtitle: z.string(),
  ctaText: z.string(),
  ctaLink: z.string(),
  backgroundImage: z.string().optional(),
  overlayOpacity: z.boolean(),
});

type FormData = z.infer<typeof schema>;

export default function HeroSettingsPage() {
  const t = useTranslations("context.hero");
  const tp = useTranslations("pages");
  const tc = useTranslations("common");
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ["context", "hero"],
    queryFn: () => getContextSection("hero"),
  });

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      headline: "",
      subtitle: "",
      ctaText: "",
      ctaLink: "",
      backgroundImage: "",
      overlayOpacity: true,
    },
  });

  useEffect(() => {
    const sectionData = (data?.data ?? {}) as Partial<FormData>;
    if (Object.keys(sectionData).length > 0) {
      form.reset({ ...form.getValues(), ...sectionData });
    }
  }, [data, form]);

  const mutation = useMutation({
    mutationFn: (payload: FormData) => updateContextSection("hero", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["context", "hero"] });
      toast.success(tc("save"));
    },
  });

  const handleImageUpload = async (files: File[]) => {
    const file = files[0];
    if (!file) return;
    const { url } = await uploadFile(file);
    form.setValue("backgroundImage", url);
  };

  return (
    <PageTransition>
      <PageHeader title={tp("titles.heroSettings")} description={t("videoHint")} />
      <form onSubmit={form.handleSubmit((v) => mutation.mutate(v))}>
        <Card>
          <CardHeader>
            <CardTitle>{t("title")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>{t("buttonName")}</Label>
                <Input {...form.register("headline")} placeholder={t("buttonNamePlaceholder")} />
              </div>
              <div className="space-y-2">
                <Label>{t("button2")}</Label>
                <Input {...form.register("subtitle")} placeholder={t("buttonNamePlaceholder")} />
              </div>
              <div className="space-y-2">
                <Label>{t("buttonName")}</Label>
                <Input {...form.register("ctaText")} placeholder={t("buttonNamePlaceholder")} />
              </div>
              <div className="space-y-2">
                <Label>{t("buttonLink")}</Label>
                <Input {...form.register("ctaLink")} placeholder={t("buttonLinkPlaceholder")} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t("uploadVideo")}</Label>
              {form.watch("backgroundImage") && (
                <img
                  src={form.watch("backgroundImage")}
                  alt=""
                  className="mb-2 h-32 w-full rounded-lg object-cover"
                />
              )}
              <FileDropzone onDrop={handleImageUpload} accept={{ "image/*": [] }} label={t("uploadVideo")} />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div>
                <p className="font-medium">{t("removeVideo")}</p>
                <p className="text-sm text-muted-foreground">{t("videoHint")}</p>
              </div>
              <Switch
                checked={form.watch("overlayOpacity")}
                onCheckedChange={(v) => form.setValue("overlayOpacity", v)}
              />
            </div>

            <Button type="submit" disabled={mutation.isPending}>
              {t("save")}
            </Button>
          </CardContent>
        </Card>
      </form>
    </PageTransition>
  );
}
