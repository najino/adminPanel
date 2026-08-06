"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/shared/page-elements";
import { PageTransition } from "@/components/shared/page-transition";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const sections = [
  { href: "/context/hero", titleKey: "overview.heroCardTitle", descKey: "overview.heroCardDescription" },
  { href: "/context/product-slides", titleKey: "productSlides.slidesCardTitle", descKey: "productSlides.slidesCardDescription" },
  { href: "/context/pro-banners", titleKey: "proBanners.cardTitle", descKey: "proBanners.cardDescription" },
  { href: "/context/brands", titleKey: "brands.cardTitle", descKey: "brands.cardDescription" },
  { href: "/context/customer-reviews", titleKey: "customerReviews.cardTitle", descKey: "customerReviews.cardDescription" },
  { href: "/context/faq", titleKey: "faq.cardTitle", descKey: "faq.cardDescription" },
  { href: "/context/contact-us", titleKey: "contactUs.cardTitle", descKey: "contactUs.cardDescription" },
  { href: "/context/navigation", titleKey: "navigation.cardTitle", descKey: "navigation.cardDescription" },
] as const;

export default function ContextOverviewPage() {
  const t = useTranslations("context");
  const tp = useTranslations("pages");

  return (
    <PageTransition>
      <PageHeader title={tp("titles.context")} description={t("overview.description")} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((section) => {
          const title = t(section.titleKey);
          return (
            <article key={section.href} className="relative">
              <Card className="h-full transition-colors hover:border-primary/50 hover:bg-muted/30">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between gap-2 text-base">
                    <Link
                      href={section.href}
                      className="stretched-link text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    >
                      {title}
                    </Link>
                    <ArrowRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                  </CardTitle>
                  <CardDescription>{t(section.descKey)}</CardDescription>
                </CardHeader>
              </Card>
            </article>
          );
        })}
      </div>
    </PageTransition>
  );
}
