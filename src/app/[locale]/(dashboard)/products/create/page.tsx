"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageTransition } from "@/components/shared/page-transition";
import { PageHeader } from "@/components/shared/page-elements";
import { FileDropzone } from "@/components/shared/file-dropzone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createProduct, getCategories } from "@/services/data.service";
import type { ProductStatus } from "@/types";

const productSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  sku: z.string().min(1),
  price: z.coerce.number().min(0),
  compareAtPrice: z.coerce.number().optional(),
  cost: z.coerce.number().optional(),
  category: z.string().min(1),
  tags: z.string(),
  brand: z.string().min(1),
  status: z.enum(["active", "inactive", "lowStock", "outOfStock"]),
  stock: z.coerce.number().min(0),
  attributes: z.array(
    z.object({
      key: z.string().min(1),
      value: z.string().min(1),
    }),
  ),
});

type ProductForm = z.infer<typeof productSchema>;

export default function CreateProductPage() {
  const t = useTranslations("products");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [images, setImages] = useState<string[]>([]);

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      status: "active",
      stock: 0,
      attributes: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "attributes",
  });

  const status = watch("status");

  const mutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      toast.success(t("form.actions.saveProduct"));
      router.push("/products");
    },
    onError: () => toast.error("Failed to create product"),
  });

  const onSubmit = (data: ProductForm) => {
    mutation.mutate({
      name: data.name,
      description: data.description,
      sku: data.sku,
      price: data.price,
      compareAtPrice: data.compareAtPrice,
      cost: data.cost,
      category: data.category,
      tags: data.tags.split(",").map((t) => t.trim()).filter(Boolean),
      brand: data.brand,
      status: data.status as ProductStatus,
      stock: data.stock,
      images,
      attributes: data.attributes.map((a) => ({ key: a.key, values: [a.value] })),
    });
  };

  const handleImageDrop = (files: File[]) => {
    const urls = files.map((f) => URL.createObjectURL(f));
    setImages((prev) => [...prev, ...urls]);
  };

  return (
    <PageTransition>
      <PageHeader title={t("addProductTitle")} />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("form.information.title")}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label>{t("form.information.productName")}</Label>
              <Input
                placeholder={t("form.information.productNamePlaceholder")}
                {...register("name")}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>{t("form.information.description")}</Label>
              <Textarea rows={4} {...register("description")} />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>{t("form.pricing.sku")}</Label>
              <Input placeholder={t("form.pricing.skuPlaceholder")} {...register("sku")} />
            </div>
            <div className="space-y-2">
              <Label>{t("form.organization.brand")}</Label>
              <Input {...register("brand")} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("form.pricing.title")}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label>{t("form.pricing.price")}</Label>
              <Input type="number" step="0.01" {...register("price")} />
            </div>
            <div className="space-y-2">
              <Label>{t("form.pricing.compareAtPrice")}</Label>
              <Input type="number" step="0.01" {...register("compareAtPrice")} />
            </div>
            <div className="space-y-2">
              <Label>{t("form.pricing.cost")}</Label>
              <Input type="number" step="0.01" {...register("cost")} />
            </div>
            <div className="space-y-2">
              <Label>{t("form.pricing.stockQuantity")}</Label>
              <Input type="number" {...register("stock")} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("form.organization.title")}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t("form.organization.category")}</Label>
              <Select onValueChange={(v) => setValue("category", v)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t("form.organization.selectCategory")} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.name}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("form.organization.status")}</Label>
              <Select value={status} onValueChange={(v) => setValue("status", v as ProductForm["status"])}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">{t("form.organization.statusOptions.active")}</SelectItem>
                  <SelectItem value="inactive">{tCommon("status.inactive")}</SelectItem>
                  <SelectItem value="lowStock">{tCommon("status.lowStock")}</SelectItem>
                  <SelectItem value="outOfStock">{tCommon("status.outOfStock")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Tags</Label>
              <Input placeholder="apple, laptop" {...register("tags")} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{t("form.attributes.title")}</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ key: "", value: "" })}
            >
              <Plus className="mr-1 h-4 w-4" />
              {t("form.attributes.addAttribute")}
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-end gap-3">
                <div className="flex-1 space-y-2">
                  <Label>{t("form.attributes.attribute")}</Label>
                  <Input {...register(`attributes.${index}.key`)} />
                </div>
                <div className="flex-1 space-y-2">
                  <Label>{t("form.attributes.value")}</Label>
                  <Input {...register(`attributes.${index}.value`)} />
                </div>
                <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("form.images.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <FileDropzone
              onDrop={handleImageDrop}
              multiple
              accept={{ "image/*": [".png", ".jpg", ".jpeg", ".webp"] }}
              label={t("form.images.dropzone")}
            />
            {images.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-3">
                {images.map((url, i) => (
                  <img key={i} src={url} alt="" className="h-20 w-20 rounded-lg object-cover" />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? tCommon("loading") : t("form.actions.saveProduct")}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/products">{t("form.actions.cancel")}</Link>
          </Button>
        </div>
      </form>
    </PageTransition>
  );
}
