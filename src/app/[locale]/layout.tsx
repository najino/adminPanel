import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { QueryProvider, ThemeProvider, AuthProvider, ZodI18nProvider } from "@/providers";
import { Toaster } from "sonner";
import { Vazirmatn, Inter } from "next/font/google";
import "../globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const vazirmatn = Vazirmatn({
  subsets: ["arabic"],
  variable: "--font-vazirmatn",
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
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

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning className={fontClass}>
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
                  <Toaster richColors position="top-center" toastOptions={{ className: "font-sans" }} />
                </AuthProvider>
              </QueryProvider>
            </ThemeProvider>
          </ZodI18nProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
