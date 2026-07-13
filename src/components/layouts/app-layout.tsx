"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
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
    <div className="flex h-screen overflow-hidden bg-background p-3 lg:gap-4">
      <div className="hidden shrink-0 lg:block">
        <Sidebar collapsed={collapsed} />
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side={sheetSide}
          className="w-[280px] border-0 bg-transparent p-0 shadow-none sm:max-w-[280px]"
        >
          <Sidebar collapsed={false} onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border/50 bg-background/80 shadow-elevated-sm">
        <Header
          onToggleSidebar={() => {
            if (window.innerWidth < 1024) {
              setMobileOpen(true);
            } else {
              setCollapsed(!collapsed);
            }
          }}
        />
        <main className="scrollbar-premium flex-1 overflow-y-auto surface-muted p-4 lg:p-6">
          <div className={cn("mx-auto w-full max-w-[1440px]")}>{children}</div>
        </main>
      </div>
    </div>
  );
}
