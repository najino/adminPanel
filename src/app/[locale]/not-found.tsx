"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  const t = useTranslations("errors.notFound");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <p
        className="text-7xl font-bold tracking-tight text-muted-foreground/40"
        aria-hidden
      >
        404
      </p>
      <h1 className="mt-4 text-2xl font-bold tracking-tight lg:text-3xl">{t("heading")}</h1>
      <p className="mt-4 max-w-md text-muted-foreground">{t("message")}</p>
      <Button asChild className="mt-8">
        <Link href="/">{t("backButton")}</Link>
      </Button>
      <p className="mt-12 text-xs text-muted-foreground">
        {t("footer", { year: new Date().getFullYear() })}
      </p>
    </div>
  );
}
