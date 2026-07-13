"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-elements";
import { PageTransition } from "@/components/shared/page-transition";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getStoreStyle, updateStoreStyle } from "@/services/data.service";

const fonts = ["Inter", "Roboto", "Open Sans", "Lato", "Poppins", "Vazirmatn"];

export default function SetStylePage() {
  const t = useTranslations("context.setStyle");
  const tp = useTranslations("pages");
  const tc = useTranslations("common");
  const queryClient = useQueryClient();
  const [primaryColor, setPrimaryColor] = useState("#465fff");
  const [fontFamily, setFontFamily] = useState("Inter");

  const { data: style } = useQuery({
    queryKey: ["store-style"],
    queryFn: getStoreStyle,
  });

  useEffect(() => {
    if (style) {
      setPrimaryColor(style.primaryColor ?? "#465fff");
      setFontFamily(style.fontFamily ?? "Inter");
    }
  }, [style]);

  const mutation = useMutation({
    mutationFn: () => updateStoreStyle({ primaryColor, fontFamily }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["store-style"] });
      toast.success(tc("save"));
    },
    onError: () => toast.error(tc("saveFailed")),
  });

  return (
    <PageTransition>
      <PageHeader title={tp("titles.setStyleSettings")} description={t("description")} />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("colorsTitle")}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label>{t("colors.primary")}</Label>
              <div className="flex gap-3">
                <Input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="h-10 w-16 cursor-pointer p-1"
                />
                <Input value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label>{t("fontsTitle")}</Label>
              <Select value={fontFamily} onValueChange={setFontFamily}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fonts.map((font) => (
                    <SelectItem key={font} value={font}>
                      {font}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
              {t("save")}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="rounded-xl border border-border p-6"
              style={{ fontFamily, borderColor: primaryColor }}
            >
              <h3 className="text-lg font-bold" style={{ color: primaryColor }}>
                Store Preview
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {t("fontsHint")}
              </p>
              <Button className="mt-4" style={{ backgroundColor: primaryColor }}>
                Sample Button
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
