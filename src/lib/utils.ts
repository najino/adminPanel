import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatJalaliDate } from "@/lib/date";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, locale = "fa-IR") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "IRR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Formats dates in Jalali (Shamsi) calendar for Persian admin display.
 * Pass `locale` starting with `en` only if Gregorian is explicitly needed.
 */
export function formatDate(date: string | Date, locale = "fa") {
  if (!date) return "";
  const parsed = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(parsed.getTime())) return String(date);

  const normalized = locale.toLowerCase();
  if (normalized.startsWith("en")) {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(parsed);
  }

  return formatJalaliDate(parsed);
}
