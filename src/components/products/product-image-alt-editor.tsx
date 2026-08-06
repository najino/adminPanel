"use client";

import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { ProductImagePayload } from "@/types/api/products";

type ProductImageAltEditorProps = {
  images: ProductImagePayload[];
  onChange: (images: ProductImagePayload[]) => void;
  onRemove: (url: string) => void;
  mainBadgeLabel: string;
  altLabel: string;
  altPlaceholder: string;
  removeLabel: string;
};

/**
 * CMS image list with editable alt text (images.md requirement).
 */
export function ProductImageAltEditor({
  images,
  onChange,
  onRemove,
  mainBadgeLabel,
  altLabel,
  altPlaceholder,
  removeLabel,
}: ProductImageAltEditorProps) {
  const updateAlt = (index: number, alt_text: string) => {
    onChange(
      images.map((img, i) => (i === index ? { ...img, alt_text } : img))
    );
  };

  if (images.length === 0) return null;

  return (
    <ul className="mt-4 grid gap-4 sm:grid-cols-2">
      {images.map((img, i) => (
        <li
          key={`${img.url}-${i}`}
          className="group relative flex gap-3 rounded-xl border border-border bg-card p-3"
        >
          <div className="relative size-20 shrink-0 overflow-hidden rounded-lg ring-1 ring-border">
            {/* Admin preview: explicit size for CLS; alt mirrors editable field */}
            <img
              src={img.url}
              alt={img.alt_text?.trim() || altPlaceholder}
              width={80}
              height={80}
              className="size-full object-cover"
            />
            {i === 0 && (
              <span className="absolute start-1 top-1 rounded bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">
                {mainBadgeLabel}
              </span>
            )}
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <Label
              htmlFor={`product-image-alt-${i}`}
              className="text-xs text-muted-foreground"
            >
              {altLabel}
            </Label>
            <Input
              id={`product-image-alt-${i}`}
              value={img.alt_text ?? ""}
              onChange={(e) => updateAlt(i, e.target.value)}
              placeholder={altPlaceholder}
              maxLength={200}
              className="h-9"
            />
            <p
              className={cn(
                "truncate text-[10px] text-muted-foreground",
                "dir-ltr text-start"
              )}
              title={img.url}
            >
              {img.url.split("/").pop()}
            </p>
          </div>

          <button
            type="button"
            onClick={() => onRemove(img.url)}
            className="absolute -end-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground opacity-0 shadow transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
            aria-label={removeLabel}
          >
            <X className="size-3" />
          </button>
        </li>
      ))}
    </ul>
  );
}
