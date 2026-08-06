import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { routing } from "@/i18n/routing";
import { QueryProvider, ThemeProvider, AuthProvider, ZodI18nProvider } from "@/providers";
import { Toaster } from "sonner";
import { Vazirmatn, Inter } from "next/font/google";
import { getSiteUrl } from "@/config/site";
import { ADMIN_ROBOTS } from "@/lib/seo/metadata";
import "../globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
  adjustFontFallback: true,
});

const vazirmatn = Vazirmatn({
  subsets: ["arabic"],
  variable: "--font-vazirmatn",
  display: "swap",
  preload: true,
  adjustFontFallback: true,
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "common" });
  const siteUrl = getSiteUrl();

  return {
    ...(siteUrl ? { metadataBase: new URL(siteUrl) } : {}),
    title: {
      default: t("meta.dashboardTitle"),
      template: `%s | ${t("appName")}`,
    },
    description: t("meta.dashboardDescription"),
    robots: ADMIN_ROBOTS,
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as "en" | "fa")) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();
  const dir = locale === "fa" ? "rtl" : "ltr";
  const fontClass = locale === "fa" ? vazirmatn.variable : inter.variable;

  const siteUrl = getSiteUrl();
  let apiOrigin: string | null = null;
  try {
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (apiBase) apiOrigin = new URL(apiBase).origin;
  } catch {
    apiOrigin = null;
  }

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning className={fontClass}>
      <head>
        {apiOrigin && (
          <>
            <link rel="preconnect" href={apiOrigin} crossOrigin="anonymous" />
            <link rel="dns-prefetch" href={apiOrigin} />
          </>
        )}
        {siteUrl && siteUrl !== apiOrigin && <link rel="dns-prefetch" href={siteUrl} />}
      </head>
      <body
        className="min-h-screen bg-background font-sans antialiased"
        suppressHydrationWarning
      >
        <NextIntlClientProvider messages={messages}>
          <ZodI18nProvider>
            <ThemeProvider>
              <QueryProvider>
                <AuthProvider>
                  {children}
                  <Toaster
                    richColors
                    position="top-center"
                    toastOptions={{ className: "font-sans" }}
                  />
                </AuthProvider>
              </QueryProvider>
            </ThemeProvider>
          </ZodI18nProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
