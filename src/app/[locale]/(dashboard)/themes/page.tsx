"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Eye } from "lucide-react";
import { PageHeader } from "@/components/shared/page-elements";
import { PageTransition } from "@/components/shared/page-transition";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
            <article key={theme.id} className="relative">
              <Card className="overflow-hidden">
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
                  aria-hidden
                />
                <CardHeader>
                  <CardTitle as="h3">
                    <Link
                      href={`/checkout/themes/${theme.id}`}
                      className="stretched-link outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      {theme.name}
                    </Link>
                  </CardTitle>
                  <CardDescription>{theme.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <span className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-md border border-input bg-background px-4 text-sm font-medium shadow-xs">
                    <Eye className="size-4" aria-hidden />
                    {t("preview")}
                  </span>
                </CardContent>
              </Card>
            </article>
          ))}
        </div>
      )}
    </PageTransition>
  );
}
