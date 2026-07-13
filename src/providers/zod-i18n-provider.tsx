"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { z } from "zod";
import { createZodErrorMap } from "@/lib/zod-error-map";

export function ZodI18nProvider({ children }: { children: React.ReactNode }) {
  const t = useTranslations("common.validation");

  useEffect(() => {
    z.setErrorMap(createZodErrorMap(t));
  }, [t]);

  // Apply immediately on render so first form submit in the same tick is covered
  z.setErrorMap(createZodErrorMap(t));

  return <>{children}</>;
}
