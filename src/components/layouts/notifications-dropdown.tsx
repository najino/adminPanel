"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import {
  Bell,
  MessageCircleMore,
  Package,
  ShoppingCart,
  Star,
  UserRound,
  Inbox,
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
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/services/data.service";
import type { AdminNotification, AdminNotificationType } from "@/types";
import { cn } from "@/lib/utils";

const typeIcons: Record<AdminNotificationType, typeof Bell> = {
  order: ShoppingCart,
  review: Star,
  comment: MessageCircleMore,
  stock: Package,
  contact: Inbox,
  user: UserRound,
};

function formatRelativeTime(iso: string, t: ReturnType<typeof useTranslations>) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.max(1, Math.floor(diffMs / 60_000));
  if (mins < 60) return t("time.minutes", { count: mins });
  const hours = Math.floor(mins / 60);
  if (hours < 24) return t("time.hours", { count: hours });
  const days = Math.floor(hours / 24);
  return t("time.days", { count: days });
}

function notificationTitle(
  item: AdminNotification,
  t: ReturnType<typeof useTranslations>,
): string {
  try {
    return t(item.titleKey as never, item.titleParams as never);
  } catch {
    return item.titleKey;
  }
}

function notificationDescription(
  item: AdminNotification,
  t: ReturnType<typeof useTranslations>,
): string | null {
  if (!item.descriptionKey) return null;
  try {
    return t(item.descriptionKey as never);
  } catch {
    return null;
  }
}

export function NotificationsDropdown() {
  const t = useTranslations("common.notification");
  const tc = useTranslations("common");
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications"],
    queryFn: getNotifications,
    refetchInterval: 60_000,
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markReadMutation = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const markAllMutation = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const handleOpen = (item: AdminNotification) => {
    if (!item.read) markReadMutation.mutate(item.id);
    router.push(item.href);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="relative rounded-xl"
          aria-label={tc("notifications")}
        >
          <Bell className="size-[18px]" />
          {unreadCount > 0 && (
            <span className="absolute end-1.5 top-1.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-semibold leading-none text-destructive-foreground ring-2 ring-background">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[min(100vw-2rem,22rem)] rounded-xl p-0">
        <div className="flex items-center justify-between gap-2 px-3 py-2.5">
          <DropdownMenuLabel className="p-0 text-sm font-semibold">{t("title")}</DropdownMenuLabel>
          {unreadCount > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-primary"
              onClick={(e) => {
                e.preventDefault();
                markAllMutation.mutate();
              }}
              disabled={markAllMutation.isPending}
            >
              {t("markAllRead")}
            </Button>
          )}
        </div>
        <DropdownMenuSeparator className="m-0" />

        <div className="max-h-80 overflow-y-auto scrollbar-premium">
          {notifications.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-muted-foreground">{t("empty")}</p>
          ) : (
            notifications.map((item) => {
              const Icon = typeIcons[item.type] ?? Bell;
              const description = notificationDescription(item, t);
              return (
                <DropdownMenuItem
                  key={item.id}
                  className={cn(
                    "cursor-pointer items-start gap-3 rounded-none px-3 py-3 focus:bg-accent",
                    !item.read && "bg-primary/5",
                  )}
                  onSelect={() => handleOpen(item)}
                >
                  <span
                    className={cn(
                      "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg",
                      item.read ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary",
                    )}
                  >
                    <Icon className="size-4" strokeWidth={1.5} />
                  </span>
                  <span className="min-w-0 flex-1 space-y-0.5">
                    <span className="flex items-start justify-between gap-2">
                      <span className="text-sm font-medium leading-snug">
                        {notificationTitle(item, t)}
                      </span>
                      {!item.read && (
                        <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
                      )}
                    </span>
                    {description && (
                      <span className="block line-clamp-2 text-xs text-muted-foreground">
                        {description}
                      </span>
                    )}
                    <span className="block text-[11px] text-muted-foreground">
                      {formatRelativeTime(item.createdAt, t)}
                    </span>
                  </span>
                </DropdownMenuItem>
              );
            })
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
