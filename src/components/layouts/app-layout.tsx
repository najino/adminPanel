"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useAuth } from "@/providers/auth-provider";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { getAccessToken } from "@/api/client";
import { cn } from "@/lib/utils";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("common");
  const sheetSide = locale === "fa" ? "right" : "left";

  useEffect(() => {
    if (!isLoading) {
      const token = getAccessToken();
      if (!token && !isAuthenticated) {
        router.replace("/signin");
      }
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-muted p-3 lg:gap-4 dark:bg-background">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-[100] focus:rounded-xl focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground focus:shadow-elevated-md"
      >
        {t("a11y.skipToContent")}
      </a>

      <div className="hidden shrink-0 lg:block">
        <Sidebar collapsed={collapsed} />
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side={sheetSide}
          className="w-[300px] border-0 bg-transparent p-0 shadow-none sm:max-w-[300px]"
        >
          <Sidebar collapsed={false} onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-3xl border border-border/70 bg-card shadow-elevated-md backdrop-blur-xl dark:border-white/5 dark:bg-card/90">
        <Header
          onToggleSidebar={() => {
            if (window.innerWidth < 1024) {
              setMobileOpen(true);
            } else {
              setCollapsed(!collapsed);
            }
          }}
        />
        <main
          id="main-content"
          tabIndex={-1}
          aria-label={t("a11y.mainContent")}
          className="scrollbar-premium flex-1 overflow-y-auto bg-background/40 p-4 outline-none lg:p-6 dark:bg-transparent"
        >
          <div className={cn("mx-auto w-full max-w-[1440px]")}>{children}</div>
        </main>
        <footer
          aria-label={t("a11y.siteFooter")}
          className="shrink-0 border-t border-border/70 px-4 py-3 text-center text-xs text-muted-foreground lg:px-6 dark:border-white/5"
        >
          {t("a11y.footerCopyright", {
            year: new Date().getFullYear(),
            appName: t("appName"),
          })}
        </footer>
      </div>
    </div>
  );
}
