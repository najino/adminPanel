"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import {
  Bell,
  FileText,
  Globe,
  LogOut,
  Menu,
  Moon,
  PackagePlus,
  Plus,
  Search,
  ShoppingCart,
  Sun,
  Ticket,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/providers/auth-provider";
import { cn } from "@/lib/utils";

interface HeaderProps {
  onToggleSidebar: () => void;
}

export function Header({ onToggleSidebar }: HeaderProps) {
  const t = useTranslations("common");
  const tNav = useTranslations("navigation");
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const locale = useLocale();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const nextLocale = locale === "fa" ? "en" : "fa";
  const initials =
    `${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}`.toUpperCase() || "U";

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  const switchLocale = () => {
    const segments = window.location.pathname.split("/");
    if (segments[1] === "fa" || segments[1] === "en") {
      segments[1] = nextLocale;
      router.push(segments.join("/") || `/${nextLocale}`);
    } else {
      router.push(`/${nextLocale}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-3 border-b border-border/60 glass-panel px-4 lg:px-6">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="rounded-xl"
        onClick={onToggleSidebar}
        aria-label={t("toggleSidebar")}
      >
        <Menu className="size-[18px]" />
      </Button>

      <div className="relative hidden min-w-0 flex-1 md:block md:max-w-md">
        <Search
          className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          placeholder={t("searchPlaceholder")}
          className="h-9 rounded-xl border-border/70 bg-background/60 ps-9 shadow-none"
          aria-label={t("search")}
        />
      </div>

      <div className="ms-auto flex items-center gap-1.5">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" size="sm" className="hidden gap-1.5 rounded-xl sm:inline-flex">
              <Plus className="size-4" aria-hidden />
              {t("quickCreate")}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52 rounded-xl">
            <DropdownMenuLabel>{t("quickCreate")}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/products/create")} className="gap-2">
              <PackagePlus className="size-4" />
              {tNav("addProduct")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/orders")} className="gap-2">
              <ShoppingCart className="size-4" />
              {tNav("allOrders")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/coupons")} className="gap-2">
              <Ticket className="size-4" />
              {tNav("coupons")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/weblog/create")} className="gap-2">
              <FileText className="size-4" />
              {tNav("addPost")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="rounded-xl"
          onClick={() => setTheme(isDark ? "light" : "dark")}
          aria-label={t("theme")}
        >
          {isDark ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="rounded-xl"
          onClick={switchLocale}
          aria-label={t("language")}
        >
          <Globe className="size-[18px]" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="relative rounded-xl"
          aria-label={t("notifications")}
        >
          <Bell className="size-[18px]" />
          <span className="absolute end-1.5 top-1.5 size-2 rounded-full bg-destructive ring-2 ring-background" />
        </Button>

        <Separator orientation="vertical" className="mx-1 hidden h-6 sm:block" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              className={cn("h-9 gap-2 rounded-xl px-2")}
              aria-label={t("user.profile")}
            >
              <Avatar className="size-7">
                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
              </Avatar>
              <span className="hidden max-w-[120px] truncate text-sm font-medium lg:inline">
                {user?.firstName ?? t("user.profile")}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 rounded-xl">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium">
                  {user?.firstName} {user?.lastName}
                </span>
                <span className="text-xs text-muted-foreground">{user?.email}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="gap-2 text-destructive focus:text-destructive"
              onClick={() => signOut()}
            >
              <LogOut className="size-4" />
              {t("signOut")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
