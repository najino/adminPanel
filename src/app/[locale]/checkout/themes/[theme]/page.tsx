import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ArrowLeft, CreditCard, Lock, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";

const themes = {
  "bold-dark": {
    name: "Bold Dark",
    bg: "#0f0f1a",
    card: "#1a1a2e",
    text: "#ffffff",
    muted: "#94a3b8",
    accent: "#f59e0b",
    border: "#2d2d44",
  },
  "minimal-light": {
    name: "Minimal Light",
    bg: "#fafafa",
    card: "#ffffff",
    text: "#111827",
    muted: "#6b7280",
    accent: "#111827",
    border: "#e5e7eb",
  },
  "modern-blue": {
    name: "Modern Blue",
    bg: "#f0f4ff",
    card: "#ffffff",
    text: "#1e293b",
    muted: "#64748b",
    accent: "#3b82f6",
    border: "#dbeafe",
  },
} as const;

type ThemeId = keyof typeof themes;

export default async function CheckoutThemePreviewPage({
  params,
}: {
  params: Promise<{ locale: string; theme: string }>;
}) {
  const { theme: themeId } = await params;
  const theme = themes[themeId as ThemeId];

  if (!theme) notFound();

  const t = await getTranslations("context.themes");

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.bg, color: theme.text }}>
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <Button asChild variant="ghost" style={{ color: theme.muted }}>
            <Link href="/themes">
              <ArrowLeft className="me-2 h-4 w-4" />
              {t("backToThemes")}
            </Link>
          </Button>
          <span className="text-sm" style={{ color: theme.muted }}>
            {t("previewMode")}
          </span>
        </div>

        <div
          className="rounded-2xl border p-6 shadow-lg"
          style={{ backgroundColor: theme.card, borderColor: theme.border }}
        >
          <div className="mb-6 flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full"
              style={{ backgroundColor: theme.accent, color: theme.card }}
            >
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold">{theme.name}</h1>
              <p className="text-sm" style={{ color: theme.muted }}>
                Checkout Preview
              </p>
            </div>
          </div>

          <div className="space-y-3 border-b pb-6" style={{ borderColor: theme.border }}>
            {[
              { name: "Wireless Headphones", price: "$129.00" },
              { name: "Phone Case", price: "$24.00" },
            ].map((item) => (
              <div key={item.name} className="flex justify-between text-sm">
                <span>{item.name}</span>
                <span style={{ color: theme.muted }}>{item.price}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-2 py-4 text-sm">
            <div className="flex justify-between" style={{ color: theme.muted }}>
              <span>Subtotal</span>
              <span>$153.00</span>
            </div>
            <div className="flex justify-between" style={{ color: theme.muted }}>
              <span>Shipping</span>
              <span>$5.00</span>
            </div>
            <div className="flex justify-between text-base font-bold">
              <span>Total</span>
              <span style={{ color: theme.accent }}>$158.00</span>
            </div>
          </div>

          <div
            className="mb-4 rounded-lg border p-4"
            style={{ borderColor: theme.border }}
          >
            <div className="mb-2 flex items-center gap-2 text-sm font-medium">
              <CreditCard className="h-4 w-4" style={{ color: theme.accent }} />
              Payment Details
            </div>
            <div className="flex flex-col gap-2">
              <div className="h-9 rounded-md" style={{ backgroundColor: theme.bg, border: `1px solid ${theme.border}` }} />
              <div className="grid grid-cols-2 gap-2">
                <div className="h-9 rounded-md" style={{ backgroundColor: theme.bg, border: `1px solid ${theme.border}` }} />
                <div className="h-9 rounded-md" style={{ backgroundColor: theme.bg, border: `1px solid ${theme.border}` }} />
              </div>
            </div>
          </div>

          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-lg py-3 font-semibold transition-opacity hover:opacity-90"
            style={{ backgroundColor: theme.accent, color: themeId === "minimal-light" ? "#fff" : theme.card }}
          >
            <Lock className="h-4 w-4" />
            Complete Order — $158.00
          </button>
        </div>
      </div>
    </div>
  );
}
