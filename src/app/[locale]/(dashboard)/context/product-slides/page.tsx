"use client";

import { useState } from "react";
import { useContextSection } from "@/hooks/use-context-section";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-elements";
import { PageTransition } from "@/components/shared/page-transition";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { updateContextSection } from "@/services/data.service";

type SlideTab = "newest" | "bestsellers" | "discounted";

interface SlideConfig {
  title: string;
  autoplayInterval: number;
  productIds: string[];
}

const defaultSlides: Record<SlideTab, SlideConfig> = {
  newest: { title: "", autoplayInterval: 4500, productIds: [] },
  bestsellers: { title: "", autoplayInterval: 4500, productIds: [] },
  discounted: { title: "", autoplayInterval: 4500, productIds: [] },
};

export default function ProductSlidesPage() {
  const t = useTranslations("context.productSlides");
  const tp = useTranslations("pages");
  const tc = useTranslations("common");
  const queryClient = useQueryClient();
  const { state: slides, setState: setSlides } = useContextSection<Record<SlideTab, SlideConfig>>(
    "product-slides",
    defaultSlides,
  );
  const [productInput, setProductInput] = useState<Record<SlideTab, string>>({
    newest: "",
    bestsellers: "",
    discounted: "",
  });

  const mutation = useMutation({
    mutationFn: () => updateContextSection("product-slides", slides),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["context", "product-slides"] });
      toast.success(tc("save"));
    },
  });

  const updateSlide = (tab: SlideTab, field: keyof SlideConfig, value: string | number) => {
    setSlides((prev) => ({
      ...prev,
      [tab]: { ...prev[tab], [field]: value },
    }));
  };

  const addProduct = (tab: SlideTab) => {
    const id = productInput[tab].trim();
    if (!id) return;
    setSlides((prev) => ({
      ...prev,
      [tab]: { ...prev[tab], productIds: [...prev[tab].productIds, id] },
    }));
    setProductInput((prev) => ({ ...prev, [tab]: "" }));
  };

  const tabLabels: Record<SlideTab, string> = {
    newest: t("featured.title"),
    bestsellers: t("bestseller.title"),
    discounted: t("discounted.title"),
  };

  return (
    <PageTransition>
      <PageHeader title={tp("titles.productSlidesSettings")} description={t("featured.description")} />
      <Tabs defaultValue="newest">
        <TabsList>
          <TabsTrigger value="newest">{t("iconSparkles")}</TabsTrigger>
          <TabsTrigger value="bestsellers">{t("iconFlame")}</TabsTrigger>
          <TabsTrigger value="discounted">{t("iconBadgePercent")}</TabsTrigger>
        </TabsList>

        {(["newest", "bestsellers", "discounted"] as SlideTab[]).map((tab) => (
          <TabsContent key={tab} value={tab}>
            <Card>
              <CardHeader>
                <CardTitle>{tabLabels[tab]}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>{t("sectionTitle")}</Label>
                    <Input
                      value={slides[tab].title}
                      onChange={(e) => updateSlide(tab, "title", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("autoplayInterval")}</Label>
                    <Input
                      type="number"
                      value={slides[tab].autoplayInterval}
                      onChange={(e) => updateSlide(tab, "autoplayInterval", Number(e.target.value))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{t("products")}</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder={t("addProduct")}
                      value={productInput[tab]}
                      onChange={(e) => setProductInput((prev) => ({ ...prev, [tab]: e.target.value }))}
                    />
                    <Button type="button" variant="outline" onClick={() => addProduct(tab)}>
                      {tc("add")}
                    </Button>
                  </div>
                  {slides[tab].productIds.length === 0 ? (
                    <p className="text-sm text-muted-foreground">{t("noProducts")}</p>
                  ) : (
                    <ul className="space-y-1">
                      {slides[tab].productIds.map((id, i) => (
                        <li key={i} className="rounded-md border border-border px-3 py-2 text-sm">
                          {id}
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

      <div className="mt-4">
        <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
          {t("save")}
        </Button>
      </div>
    </PageTransition>
  );
}
