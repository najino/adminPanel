"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-elements";
import { PageTransition } from "@/components/shared/page-transition";
import { FileDropzone } from "@/components/shared/file-dropzone";
import { RichTextEditor } from "@/components/shared/rich-text-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createPost, getPostCategories, uploadFile } from "@/services/data.service";

const schema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  category: z.string().min(1),
  tags: z.string(),
  content: z.string(),
  publishedDate: z.string(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function CreatePostPage() {
  const t = useTranslations("posts");
  const tp = useTranslations("pages");
  const tc = useTranslations("common");
  const router = useRouter();
  const [featuredImage, setFeaturedImage] = useState<string>();

  const { data: categories = [] } = useQuery({
    queryKey: ["post-categories"],
    queryFn: getPostCategories,
  });

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      slug: "",
      category: "",
      tags: "",
      content: "",
      publishedDate: new Date().toISOString().split("T")[0],
      seoTitle: "",
      seoDescription: "",
    },
  });

  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      createPost({
        ...data,
        tags: data.tags.split(",").map((t) => t.trim()).filter(Boolean),
        featuredImage,
        status: "Draft",
      }),
    onSuccess: () => {
      toast.success(tc("save"));
      router.push("/weblog");
    },
    onError: () => toast.error(tc("saveFailed")),
  });

  const handleImageUpload = async (files: File[]) => {
    const file = files[0];
    if (!file) return;
    const { url } = await uploadFile(file);
    setFeaturedImage(url);
  };

  return (
    <PageTransition>
      <PageHeader title={tp("titles.addPost")} />
      <form onSubmit={form.handleSubmit((v) => mutation.mutate(v))} className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("form.information.title")}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label>{t("form.information.productName")}</Label>
              <Input {...form.register("title")} placeholder={t("form.information.productNamePlaceholder")} />
            </div>
            <div className="flex flex-col gap-2">
              <Label>{t("form.information.slug")}</Label>
              <Input {...form.register("slug")} placeholder={t("form.information.slugPlaceholder")} />
            </div>
            <div className="flex flex-col gap-2">
              <Label>{t("form.settings.category")}</Label>
              <Controller
                control={form.control}
                name="category"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t("form.settings.selectCategory")} />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>{t("form.seo.keywords")}</Label>
              <Input {...form.register("tags")} placeholder={t("form.seo.keywordsPlaceholder")} />
            </div>
            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label>{t("form.settings.publishDate")}</Label>
              <Input type="date" {...form.register("publishedDate")} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("form.images.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            {featuredImage && (
              <img src={featuredImage} alt="" className="mb-4 h-40 rounded-lg object-cover" />
            )}
            <FileDropzone onDrop={handleImageUpload} accept={{ "image/*": [] }} label={t("form.images.dropzone")} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("form.information.description")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Controller
              control={form.control}
              name="content"
              render={({ field }) => (
                <RichTextEditor
                  value={field.value}
                  onChange={field.onChange}
                  placeholder={t("form.information.descriptionPlaceholder")}
                />
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("form.seo.title")}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex flex-col gap-2">
              <Label>{t("form.seo.metaTitle")}</Label>
              <Input {...form.register("seoTitle")} placeholder={t("form.seo.metaTitlePlaceholder")} />
            </div>
            <div className="flex flex-col gap-2">
              <Label>{t("form.seo.metaDescription")}</Label>
              <Textarea {...form.register("seoDescription")} placeholder={t("form.seo.metaDescriptionPlaceholder")} />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={() => router.push("/weblog")}>
            {t("form.actions.cancel")}
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {t("form.actions.savePost")}
          </Button>
        </div>
      </form>
    </PageTransition>
  );
}
