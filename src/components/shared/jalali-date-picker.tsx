"use client";

import { useMemo } from "react";
import DatePicker, { type DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { isoToDateObject, toIsoEndOfDay } from "@/lib/date";
import "react-multi-date-picker/styles/layouts/mobile.css";

export function JalaliDatePicker({
  value,
  onChange,
  placeholder,
  disabled,
  className,
  id,
  "aria-label": ariaLabel,
}: {
  value?: string;
  onChange: (iso: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  "aria-label"?: string;
}) {
  const pickerValue = useMemo(() => {
    if (!value) return undefined;
    return isoToDateObject(value);
  }, [value]);

  const handleChange = (date: DateObject | DateObject[] | null) => {
    if (!date || Array.isArray(date)) {
      onChange("");
      return;
    }
    const jsDate = date.toDate();
    onChange(toIsoEndOfDay(jsDate));
  };

  return (
    <div className={cn("jalali-date-picker relative", className)}>
      <Calendar
        className="pointer-events-none absolute start-3 top-1/2 z-10 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <DatePicker
        id={id}
        value={pickerValue}
        onChange={handleChange}
        calendar={persian}
        locale={persian_fa}
        format="YYYY/MM/DD"
        disabled={disabled}
        placeholder={placeholder}
        arrow={false}
        inputClass="flex h-10 w-full rounded-md border border-input bg-background ps-9 pe-3 py-2 text-sm shadow-elevated-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        containerClassName="w-full"
        aria-label={ariaLabel}
      />
    </div>
  );
}
