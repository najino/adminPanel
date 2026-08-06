"use client";

import { useEffect, useState } from "react";
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
import { FormField } from "@/components/shared/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { uploadFile } from "@/services/data.service";
import {
  createAdminProject,
  getAdminProjectCategories,
  toProjectSlug,
  updateAdminProject,
} from "@/services/project.service";
import { describeApiError } from "@/lib/api-error";
import type { AdminProject } from "@/types/api/projects";
import { cn } from "@/lib/utils";

const schema = z.object({
  title: z.string().min(1).max(255),
  slug: z.string().min(1).max(255),
  category_id: z.string().optional(),
  description: z.string().optional(),
  employer: z.string().max(255).optional(),
  location: z.string().max(255).optional(),
  footage: z.coerce.number().min(0).optional(),
  implementation_year: z.coerce.number().min(0).max(9999).optional(),
});

type FormData = z.infer<typeof schema>;

export function ProjectForm({
  mode,
  projectId,
  initial,
  pageTitle,
}: {
  mode: "create" | "edit";
  projectId?: string;
  initial?: AdminProject;
  pageTitle: string;
}) {
  const t = useTranslations("projects");
  const tApi = useTranslations("common.apiErrors");
  const router = useRouter();
  const [image, setImage] = useState<string | undefined>(initial?.image);
  const [slugTouched, setSlugTouched] = useState(mode === "edit");

  const { data: categories = [] } = useQuery({
    queryKey: ["project-categories"],
    queryFn: getAdminProjectCategories,
  });

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: initial?.title ?? "",
      slug: initial?.slug ?? "",
      category_id: initial?.category_id ?? "",
      description: initial?.description ?? "",
      employer: initial?.employer ?? "",
      location: initial?.location ?? "",
      footage: initial?.footage,
      implementation_year: initial?.implementation_year,
    },
  });

  useEffect(() => {
    if (!initial) return;
    form.reset({
      title: initial.title,
      slug: initial.slug,
      category_id: initial.category_id ?? "",
      description: initial.description ?? "",
      employer: initial.employer ?? "",
      location: initial.location ?? "",
      footage: initial.footage,
      implementation_year: initial.implementation_year,
    });
    setImage(initial.image);
    setSlugTouched(true);
  }, [initial, form]);

  const titleValue = form.watch("title");

  useEffect(() => {
    if (slugTouched || !titleValue) return;
    form.setValue("slug", toProjectSlug(titleValue));
  }, [titleValue, slugTouched, form]);

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      const payload = {
        title: data.title.trim(),
        slug: data.slug.trim() || toProjectSlug(data.title),
        description: data.description?.trim() || undefined,
        employer: data.employer?.trim() || undefined,
        location: data.location?.trim() || undefined,
        footage:
          data.footage === undefined || Number.isNaN(data.footage)
            ? undefined
            : Math.round(data.footage),
        implementation_year:
          data.implementation_year === undefined || Number.isNaN(data.implementation_year)
            ? undefined
            : Math.round(data.implementation_year),
        image: image || undefined,
        category_id: data.category_id || undefined,
      };
      if (mode === "edit" && projectId) {
        return updateAdminProject(projectId, payload);
      }
      return createAdminProject(payload);
    },
    onSuccess: () => {
      toast.success(mode === "edit" ? t("form.actions.updateSuccess") : t("form.actions.createSuccess"));
      router.push("/projects");
    },
    onError: (err: Error) => {
      const { title, description } = describeApiError(err, tApi, "validation");
      toast.error(title, description ? { description } : undefined);
    },
  });

  const handleImageUpload = async (files: File[]) => {
    const file = files[0];
    if (!file) return;
    try {
      const { url } = await uploadFile(file);
      setImage(url);
    } catch (err) {
      const { title, description } = describeApiError(err, tApi, "unexpected");
      toast.error(t("form.images.uploadFailed"), {
        description: description || title,
      });
    }
  };

  const errors = form.formState.errors;

  return (
    <PageTransition>
      <PageHeader title={pageTitle} />
      <form
        onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
        className="flex flex-col gap-6"
      >
        <Card>
          <CardHeader>
            <CardTitle>{t("form.information.title")}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <FormField
              label={t("form.information.projectTitle")}
              htmlFor="title"
              required
              error={errors.title?.message}
              className="sm:col-span-2"
            >
              <Input
                id="title"
                className={cn("h-10", errors.title && "border-destructive")}
                placeholder={t("form.information.projectTitlePlaceholder")}
                {...form.register("title")}
              />
            </FormField>

            <FormField
              label={t("form.information.slug")}
              htmlFor="slug"
              required
              helper={t("form.information.slugHelper")}
              error={errors.slug?.message}
            >
              <Input
                id="slug"
                className={cn("h-10", errors.slug && "border-destructive")}
                placeholder={t("form.information.slugPlaceholder")}
                {...form.register("slug", {
                  onChange: () => setSlugTouched(true),
                })}
              />
            </FormField>

            <FormField
              label={t("form.information.category")}
              htmlFor="category_id"
              error={errors.category_id?.message}
            >
              <Controller
                control={form.control}
                name="category_id"
                render={({ field }) => (
                  <Select
                    value={field.value || undefined}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger id="category_id" className="h-10 w-full">
                      <SelectValue placeholder={t("form.information.selectCategory")} />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>

            <FormField
              label={t("form.information.employer")}
              htmlFor="employer"
              error={errors.employer?.message}
            >
              <Input id="employer" className="h-10" {...form.register("employer")} />
            </FormField>

            <FormField
              label={t("form.information.location")}
              htmlFor="location"
              error={errors.location?.message}
            >
              <Input id="location" className="h-10" {...form.register("location")} />
            </FormField>

            <FormField
              label={t("form.information.footage")}
              htmlFor="footage"
              error={errors.footage?.message}
            >
              <Input
                id="footage"
                type="number"
                min={0}
                className="h-10 tabular-nums"
                {...form.register("footage")}
              />
            </FormField>

            <FormField
              label={t("form.information.year")}
              htmlFor="implementation_year"
              error={errors.implementation_year?.message}
            >
              <Input
                id="implementation_year"
                type="number"
                min={0}
                max={9999}
                className="h-10 tabular-nums"
                {...form.register("implementation_year")}
              />
            </FormField>

            <FormField
              label={t("form.information.description")}
              htmlFor="description"
              error={errors.description?.message}
              className="sm:col-span-2"
            >
              <Textarea id="description" rows={4} {...form.register("description")} />
            </FormField>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("form.images.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            {image && (
              <img
                src={image}
                alt=""
                className="mb-4 h-40 rounded-lg object-cover ring-1 ring-border"
              />
            )}
            <FileDropzone
              onDrop={handleImageUpload}
              accept={{ "image/*": [".png", ".jpg", ".jpeg", ".webp", ".gif"] }}
              label={t("form.images.dropzone")}
            />
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={() => router.push("/projects")}>
            {t("form.actions.cancel")}
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mode === "edit" ? t("form.actions.update") : t("form.actions.save")}
          </Button>
        </div>
      </form>
    </PageTransition>
  );
}
