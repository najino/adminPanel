"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Info, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { PageTransition } from "@/components/shared/page-transition";
import { PageHeader } from "@/components/shared/page-elements";
import { FormField } from "@/components/shared/form-field";
import { SectionCard } from "@/components/shared/section-card";
import { FileDropzone } from "@/components/shared/file-dropzone";
import {
  ProductAttributeFields,
  type ProductAttributeRow,
} from "@/components/products/product-attribute-fields";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createAdminProduct,
  getAdminBrands,
  getAdminCategories,
  getCatalogAttributes,
  uploadProductImage,
} from "@/services/product.service";
import type { AdminProductStatus, ProductImagePayload } from "@/types/api/products";
import { cn } from "@/lib/utils";

const productSchema = z.object({
  name: z.string().min(1).max(300),
  slug: z.string().max(300).optional(),
  short_description: z.string().max(500).optional(),
  description: z.string().optional(),
  price: z.coerce.number().min(0),
  sale_price: z.number().min(0).optional(),
  category_id: z.string().optional(),
  brand: z.string().max(100).optional(),
  status: z.enum(["draft", "active", "archived"]),
  is_featured: z.boolean(),
  quantity: z.coerce.number().min(0),
  low_stock_threshold: z.coerce.number().min(0),
});

type ProductForm = z.infer<typeof productSchema>;

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-");
}

export default function CreateProductPage() {
  const t = useTranslations("products");
  const tCommon = useTranslations("common");
  const router = useRouter();

  const [attributeRows, setAttributeRows] = useState<ProductAttributeRow[]>([]);
  const [images, setImages] = useState<ProductImagePayload[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);

  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: () => getAdminCategories(),
  });

  const { data: brands = [], isLoading: brandsLoading } = useQuery({
    queryKey: ["admin-brands"],
    queryFn: getAdminBrands,
  });

  const { data: catalogAttributes = [], isLoading: attributesLoading } = useQuery({
    queryKey: ["catalog-attributes"],
    queryFn: getCatalogAttributes,
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      status: "draft",
      is_featured: false,
      quantity: 0,
      low_stock_threshold: 5,
    },
  });

  const name = watch("name");
  const status = watch("status");
  const isFeatured = watch("is_featured");

  const mutation = useMutation({
    mutationFn: createAdminProduct,
    onSuccess: (product) => {
      const skuCodes = product.skus?.map((s) => s.code).join(", ");
      toast.success(t("form.actions.saveProduct"), {
        description: skuCodes
          ? t("form.pricing.skuGenerated", { codes: skuCodes })
          : undefined,
      });
      router.push("/products");
    },
    onError: (err: Error) => {
      toast.error(err.message || t("form.actions.saveFailed"));
    },
  });

  const handleNameBlur = () => {
    if (!slugTouched && name) {
      setValue("slug", slugify(name));
    }
  };

  const handleImageDrop = async (files: File[]) => {
    setUploadingImages(true);
    try {
      const uploaded: ProductImagePayload[] = [];
      for (const file of files) {
        const result = await uploadProductImage(file);
        uploaded.push({
          url: result.url,
          alt_text: file.name.replace(/\.[^.]+$/, ""),
          sort_order: images.length + uploaded.length,
        });
      }
      setImages((prev) => [...prev, ...uploaded]);
    } catch {
      toast.error(t("form.images.uploadFailed"));
    } finally {
      setUploadingImages(false);
    }
  };

  const onSubmit = (data: ProductForm) => {
    const attributes = attributeRows
      .filter((r) => r.name.trim() && Array.isArray(r.values) && r.values.length > 0)
      .map((r) => ({ name: r.name, values: r.values }));

    mutation.mutate({
      name: data.name,
      slug: data.slug || undefined,
      short_description: data.short_description || undefined,
      description: data.description || undefined,
      price: data.price,
      sale_price:
        data.sale_price === undefined ? undefined : Number(data.sale_price),
      category_id: data.category_id || undefined,
      brand: data.brand || undefined,
      status: data.status as AdminProductStatus,
      is_featured: data.is_featured,
      attributes: attributes.length > 0 ? attributes : undefined,
      images: images.length > 0 ? images : undefined,
      inventory: {
        quantity: data.quantity,
        low_stock_threshold: data.low_stock_threshold,
      },
    });
  };

  return (
    <PageTransition>
      <PageHeader title={t("addProductTitle")} />

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <SectionCard title={t("form.information.title")}>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label={t("form.information.productName")}
              htmlFor="name"
              error={errors.name?.message}
              required
              className="sm:col-span-2"
            >
              <Input
                id="name"
                placeholder={t("form.information.productNamePlaceholder")}
                className="h-10"
                {...register("name")}
                onBlur={handleNameBlur}
              />
            </FormField>

            <FormField
              label={t("form.information.slug")}
              htmlFor="slug"
              helper={t("form.information.slugHelper")}
              error={errors.slug?.message}
            >
              <Input
                id="slug"
                placeholder={t("form.information.slugPlaceholder")}
                className="h-10"
                {...register("slug", {
                  onChange: () => setSlugTouched(true),
                })}
              />
            </FormField>

            <FormField
              label={t("form.organization.brand")}
              htmlFor="brand"
              error={errors.brand?.message}
            >
              <Select onValueChange={(v) => setValue("brand", v)} disabled={brandsLoading}>
                <SelectTrigger id="brand" className="h-10 w-full">
                  <SelectValue placeholder={t("form.organization.selectBrand")} />
                </SelectTrigger>
                <SelectContent>
                  {brands.map((brand) => (
                    <SelectItem key={brand.id} value={brand.name}>
                      {brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField
              label={t("form.information.shortDescription")}
              htmlFor="short_description"
              error={errors.short_description?.message}
              className="sm:col-span-2"
            >
              <Textarea
                id="short_description"
                rows={2}
                placeholder={t("form.information.shortDescriptionPlaceholder")}
                {...register("short_description")}
              />
            </FormField>

            <FormField
              label={t("form.information.description")}
              htmlFor="description"
              error={errors.description?.message}
              className="sm:col-span-2"
            >
              <Textarea id="description" rows={4} {...register("description")} />
            </FormField>
          </div>
        </SectionCard>

        <SectionCard title={t("form.pricing.title")}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <FormField
              label={t("form.pricing.price")}
              htmlFor="price"
              error={errors.price?.message}
              required
            >
              <Input
                id="price"
                type="text"
                inputMode="decimal"
                autoComplete="off"
                placeholder={t("form.pricing.pricePlaceholder")}
                className="h-10 tabular-nums"
                {...register("price")}
              />
            </FormField>

            <FormField
              label={t("form.pricing.salePrice")}
              htmlFor="sale_price"
              error={errors.sale_price?.message}
            >
              <Input
                id="sale_price"
                type="text"
                inputMode="decimal"
                autoComplete="off"
                className="h-10 tabular-nums"
                {...register("sale_price", {
                  setValueAs: (v) => {
                    if (v === "" || v === null || v === undefined) return undefined;
                    const n = typeof v === "number" ? v : parseFloat(String(v).replace(/,/g, ""));
                    return Number.isFinite(n) ? n : undefined;
                  },
                })}
              />
            </FormField>

            <FormField
              label={t("form.pricing.stockQuantity")}
              htmlFor="quantity"
              error={errors.quantity?.message}
            >
              <Input
                id="quantity"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                placeholder={t("form.pricing.stockPlaceholder")}
                className="h-10 tabular-nums"
                {...register("quantity")}
              />
            </FormField>

            <FormField
              label={t("form.pricing.lowStockThreshold")}
              htmlFor="low_stock_threshold"
              helper={t("form.pricing.lowStockThresholdHelper")}
              error={errors.low_stock_threshold?.message}
            >
              <Input
                id="low_stock_threshold"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                className="h-10 tabular-nums"
                {...register("low_stock_threshold")}
              />
            </FormField>
          </div>

          <div
            className={cn(
              "mt-4 flex gap-3 rounded-lg border border-info/30 bg-info-muted/50 p-4",
            )}
          >
            <Info className="mt-0.5 size-5 shrink-0 text-info" aria-hidden />
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium">{t("form.pricing.skuTitle")}</p>
              <p className="text-sm text-muted-foreground">{t("form.pricing.skuHelper")}</p>
              {attributeRows.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {t("form.pricing.skuVariantHint", { count: attributeRows.length })}
                </p>
              )}
            </div>
          </div>
        </SectionCard>

        <SectionCard title={t("form.organization.title")}>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label={t("form.organization.category")}
              htmlFor="category_id"
              error={errors.category_id?.message}
            >
              <Select
                onValueChange={(v) => setValue("category_id", v)}
                disabled={categoriesLoading}
              >
                <SelectTrigger id="category_id" className="h-10 w-full">
                  <SelectValue placeholder={t("form.organization.selectCategory")} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField label={t("form.organization.status")} htmlFor="status">
              <Select
                value={status}
                onValueChange={(v) => setValue("status", v as ProductForm["status"])}
              >
                <SelectTrigger id="status" className="h-10 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">
                    {t("form.organization.statusOptions.draft")}
                  </SelectItem>
                  <SelectItem value="active">
                    {t("form.organization.statusOptions.active")}
                  </SelectItem>
                  <SelectItem value="archived">
                    {t("form.organization.statusOptions.archived")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </FormField>

            <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-4 sm:col-span-2">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Sparkles className="size-4" aria-hidden />
                </div>
                <div className="flex flex-col gap-0.5">
                  <Label htmlFor="is_featured" className="font-medium">
                    {t("form.organization.featuredProduct")}
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {t("form.organization.featuredHelper")}
                  </p>
                </div>
              </div>
              <Switch
                id="is_featured"
                checked={isFeatured}
                onCheckedChange={(c) => setValue("is_featured", !!c)}
              />
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title={t("form.attributes.title")}
          description={t("form.attributes.subtitle")}
        >
          {attributesLoading ? (
            <div className="flex flex-col gap-2">
              <div className="h-20 animate-pulse rounded-lg bg-muted" />
            </div>
          ) : catalogAttributes.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("form.attributes.emptyCatalog")}</p>
          ) : (
            <ProductAttributeFields
              catalogAttributes={catalogAttributes}
              rows={attributeRows}
              onChange={setAttributeRows}
            />
          )}
        </SectionCard>

        <SectionCard title={t("form.images.title")}>
          <FileDropzone
            onDrop={handleImageDrop}
            multiple
            accept={{ "image/*": [".png", ".jpg", ".jpeg", ".webp", ".gif"] }}
            label={t("form.images.dropzone")}
            disabled={uploadingImages}
          />
          {uploadingImages && (
            <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              {t("form.images.uploading")}
            </div>
          )}
          {images.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-3">
              {images.map((img, i) => (
                <div key={img.url} className="relative">
                  <img
                    src={img.url}
                    alt={img.alt_text ?? ""}
                    className="size-20 rounded-lg object-cover ring-1 ring-border"
                  />
                  {i === 0 && (
                    <span className="absolute start-1 top-1 rounded bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">
                      {t("form.images.mainBadge")}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <div className="flex gap-3">
          <Button type="submit" disabled={mutation.isPending || uploadingImages}>
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
