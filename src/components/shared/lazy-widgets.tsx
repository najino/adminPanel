"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

export const SalesChartLazy = dynamic(
  () => import("@/components/charts/sales-chart").then((m) => m.SalesChart),
  {
    ssr: false,
    loading: () => <Skeleton className="h-80 w-full rounded-xl" />,
  },
);

export const RichTextEditorLazy = dynamic(
  () => import("@/components/shared/rich-text-editor").then((m) => m.RichTextEditor),
  {
    ssr: false,
    loading: () => <Skeleton className="h-48 w-full rounded-xl" />,
  },
);

export const JalaliDatePickerLazy = dynamic(
  () => import("@/components/shared/jalali-date-picker").then((m) => m.JalaliDatePicker),
  {
    ssr: false,
    loading: () => <Skeleton className="h-10 w-full rounded-md" />,
  },
);

export const SparklineLazy = dynamic(
  () => import("@/components/charts/sparkline").then((m) => m.Sparkline),
  {
    ssr: false,
    loading: () => <Skeleton className="h-12 w-full rounded-md" />,
  },
);
