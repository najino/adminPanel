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

/** Persian/Arabic digits → Latin (SEO URLs must be ASCII-safe). */
const EASTERN_DIGIT_MAP: Record<string, string> = {
  "۰": "0",
  "۱": "1",
  "۲": "2",
  "۳": "3",
  "۴": "4",
  "۵": "5",
  "۶": "6",
  "۷": "7",
  "۸": "8",
  "۹": "9",
  "٠": "0",
  "١": "1",
  "٢": "2",
  "٣": "3",
  "٤": "4",
  "٥": "5",
  "٦": "6",
  "٧": "7",
  "٨": "8",
  "٩": "9",
};

/** Minimal Persian/Arabic letter → ASCII transliteration for readable slugs. */
const FA_TRANSLIT: Record<string, string> = {
  ا: "a",
  آ: "a",
  أ: "a",
  إ: "e",
  ب: "b",
  پ: "p",
  ت: "t",
  ث: "s",
  ج: "j",
  چ: "ch",
  ح: "h",
  خ: "kh",
  د: "d",
  ذ: "z",
  ر: "r",
  ز: "z",
  ژ: "zh",
  س: "s",
  ش: "sh",
  ص: "s",
  ض: "z",
  ط: "t",
  ظ: "z",
  ع: "a",
  غ: "gh",
  ف: "f",
  ق: "gh",
  ک: "k",
  ك: "k",
  گ: "g",
  ل: "l",
  م: "m",
  ن: "n",
  و: "v",
  ه: "h",
  ة: "h",
  ی: "y",
  ي: "y",
  ى: "y",
  ئ: "y",
  ؤ: "v",
  "\u200c": "-", // ZWNJ
};

/**
 * SEO-compliant slug: lowercase, hyphen-separated, ASCII `[a-z0-9-]`.
 * Strips punctuation, collapses separators, never returns empty.
 */
export function slugify(text: string, fallbackPrefix = "item"): string {
  let s = text.normalize("NFKC").trim().toLowerCase();

  s = s.replace(/[۰-۹٠-٩]/g, (d) => EASTERN_DIGIT_MAP[d] ?? d);
  s = [...s].map((ch) => FA_TRANSLIT[ch] ?? ch).join("");

  s = s
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 200);

  return s || `${fallbackPrefix}-${Date.now().toString(36)}`;
}

/** True when slug matches SEO rules (lowercase, hyphens, no edges/doubles). */
export function isValidSeoSlug(slug: string): boolean {
  if (!slug) return false;
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

/** Normalize user/API slug input to a valid SEO slug. */
export function normalizeSeoSlug(slug: string, fallbackPrefix = "item"): string {
  return slugify(slug, fallbackPrefix);
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
