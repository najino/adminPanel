"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { PageHeader } from "@/components/shared/page-elements";
import { PageTransition } from "@/components/shared/page-transition";
import { FormField } from "@/components/shared/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getProductSlides,
  slidesToTabs,
  syncProductSlides,
  type SlideTab,
  type SlideTabConfig,
} from "@/services/storefront.service";

const TABS: SlideTab[] = ["newest", "bestsellers", "discounted"];

export default function ProductSlidesPage() {
  const t = useTranslations("context.productSlides");
  const tp = useTranslations("pages");
  const tc = useTranslations("common");
  const queryClient = useQueryClient();

  const [slides, setSlides] = useState<Record<SlideTab, SlideTabConfig>>({
    newest: { title: "", autoplayInterval: 4500, items: [] },
    bestsellers: { title: "", autoplayInterval: 4500, items: [] },
    discounted: { title: "", autoplayInterval: 4500, items: [] },
  });
  const [productInput, setProductInput] = useState<Record<SlideTab, string>>({
    newest: "",
    bestsellers: "",
    discounted: "",
  });

  const { data: serverSlides = [], isLoading } = useQuery({
    queryKey: ["product-slides"],
    queryFn: getProductSlides,
  });

  useEffect(() => {
    if (serverSlides.length > 0) {
      setSlides(slidesToTabs(serverSlides));
    }
  }, [serverSlides]);

  const saveMutation = useMutation({
    mutationFn: () => syncProductSlides(slides, serverSlides),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-slides"] });
      toast.success(t("saved"));
    },
    onError: () => toast.error(t("saveFailed")),
  });

  const updateSlide = (tab: SlideTab, field: "title" | "autoplayInterval", value: string | number) => {
    setSlides((prev) => ({
      ...prev,
      [tab]: { ...prev[tab], [field]: value },
    }));
  };

  const addProduct = (tab: SlideTab) => {
    const product_id = productInput[tab].trim();
    if (!product_id) return;
    if (slides[tab].items.some((i) => i.product_id === product_id)) return;

    setSlides((prev) => ({
      ...prev,
      [tab]: {
        ...prev[tab],
        items: [...prev[tab].items, { id: `temp-${Date.now()}`, product_id }],
      },
    }));
    setProductInput((prev) => ({ ...prev, [tab]: "" }));
  };

  const removeProduct = (tab: SlideTab, product_id: string) => {
    setSlides((prev) => ({
      ...prev,
      [tab]: {
        ...prev[tab],
        items: prev[tab].items.filter((i) => i.product_id !== product_id),
      },
    }));
  };

  const tabLabels: Record<SlideTab, string> = {
    newest: t("featured.title"),
    bestsellers: t("bestseller.title"),
    discounted: t("discounted.title"),
  };

  return (
    <PageTransition>
      <PageHeader title={tp("titles.productSlidesSettings")} description={t("featured.description")} />
      {isLoading ? (
        <p className="text-sm text-muted-foreground">{tc("loading")}</p>
      ) : (
        <Tabs defaultValue="newest">
          <TabsList>
            <TabsTrigger value="newest">{t("iconSparkles")}</TabsTrigger>
            <TabsTrigger value="bestsellers">{t("iconFlame")}</TabsTrigger>
            <TabsTrigger value="discounted">{t("iconBadgePercent")}</TabsTrigger>
          </TabsList>

          {TABS.map((tab) => (
            <TabsContent key={tab} value={tab}>
              <Card>
                <CardHeader>
                  <CardTitle>{tabLabels[tab]}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField label={t("sectionTitle")} htmlFor={`${tab}-title`}>
                      <Input
                        id={`${tab}-title`}
                        value={slides[tab].title}
                        onChange={(e) => updateSlide(tab, "title", e.target.value)}
                      />
                    </FormField>
                    <FormField label={t("autoplayInterval")} htmlFor={`${tab}-interval`}>
                      <Input
                        id={`${tab}-interval`}
                        type="number"
                        value={slides[tab].autoplayInterval}
                        onChange={(e) => updateSlide(tab, "autoplayInterval", Number(e.target.value))}
                      />
                    </FormField>
                  </div>

                  <div className="flex flex-col gap-2">
                    <span className="text-sm font-medium">{t("products")}</span>
                    <div className="flex gap-2">
                      <Input
                        placeholder={t("addProduct")}
                        value={productInput[tab]}
                        onChange={(e) => setProductInput((prev) => ({ ...prev, [tab]: e.target.value }))}
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addProduct(tab))}
                      />
                      <Button type="button" variant="outline" onClick={() => addProduct(tab)}>
                        {tc("add")}
                      </Button>
                    </div>
                    {slides[tab].items.length === 0 ? (
                      <p className="text-sm text-muted-foreground">{t("noProducts")}</p>
                    ) : (
                      <ul className="flex flex-col gap-1">
                        {slides[tab].items.map((item) => (
                          <li
                            key={item.id}
                            className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm"
                          >
                            <span>{item.product_id}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeProduct(tab, item.product_id)}
                            >
                              <Trash2 className="size-4 text-destructive" />
                            </Button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      )}

      <div className="mt-4">
        <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || isLoading}>
          {saveMutation.isPending ? tc("loading") : t("save")}
        </Button>
      </div>
    </PageTransition>
  );
}
