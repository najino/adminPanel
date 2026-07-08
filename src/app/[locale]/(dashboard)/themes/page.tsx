"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/shared/page-elements";
import { PageTransition } from "@/components/shared/page-transition";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getThemes } from "@/services/data.service";

export default function ThemesPage() {
  const t = useTranslations("context.themes");
  const tp = useTranslations("pages");

  const { data: themes = [], isLoading } = useQuery({
    queryKey: ["themes"],
    queryFn: getThemes,
  });

  return (
    <PageTransition>
      <PageHeader title={tp("titles.themesSettings")} description={t("exploreDescription")} />
      {isLoading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {themes.map((theme: { id: string; name: string; description: string }) => (
            <Card key={theme.id} className="overflow-hidden">
              <div
                className="h-32"
                style={{
                  background:
                    theme.id === "bold-dark"
                      ? "linear-gradient(135deg, #1a1a2e, #16213e)"
                      : theme.id === "minimal-light"
                        ? "linear-gradient(135deg, #f8fafc, #e2e8f0)"
                        : "linear-gradient(135deg, #1e3a5f, #3b82f6)",
                }}
              />
              <CardHeader>
                <CardTitle>{theme.name}</CardTitle>
                <CardDescription>{theme.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="w-full">
                  <Link href={`/checkout/themes/${theme.id}`}>
                    <ExternalLink className="me-2 h-4 w-4" />
                    {t("preview")}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </PageTransition>
  );
}
