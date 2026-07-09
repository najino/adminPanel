import DateObject from "react-date-object";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

/** End of local day as ISO 8601 UTC string (e.g. 2026-07-08T18:18:43.784Z). */
export function toIsoEndOfDay(date: Date): string {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d.toISOString();
}

export function isoToDateObject(iso: string): DateObject | undefined {
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return new DateObject({
    date: parsed,
    calendar: persian,
    locale: persian_fa,
  });
}

export function formatJalaliDate(iso: string | Date): string {
  const parsed = typeof iso === "string" ? new Date(iso) : iso;
  if (Number.isNaN(parsed.getTime())) return "";
  return new DateObject({
    date: parsed,
    calendar: persian,
    locale: persian_fa,
  }).format("YYYY/MM/DD");
}
