"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { getCatalogAttributeValues } from "@/services/product.service";
import type { CatalogAttribute } from "@/types/api/products";

export interface ProductAttributeRow {
  attributeId: string;
  name: string;
  values: string[];
}

function AttributeValuePicker({
  attributeId,
  selected,
  onChange,
}: {
  attributeId: string;
  selected: string[];
  onChange: (values: string[]) => void;
}) {
  const t = useTranslations("products");
  const { data: options = [], isLoading } = useQuery({
    queryKey: ["catalog-attribute-values", attributeId],
    queryFn: () => getCatalogAttributeValues(attributeId),
    enabled: !!attributeId,
  });

  if (isLoading) {
    return <Skeleton className="h-20 w-full rounded-lg" />;
  }

  if (options.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">{t("form.attributes.noValues")}</p>
    );
  }

  return (
    <div className="flex flex-wrap gap-3">
      {options.map((opt) => {
        const checked = selected.includes(opt.value);
        return (
          <label
            key={opt.id}
            className="flex cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-2 text-sm transition-colors hover:bg-muted/50"
          >
            <Checkbox
              checked={checked}
              onCheckedChange={(c) => {
                if (c) onChange([...selected, opt.value]);
                else onChange(selected.filter((v) => v !== opt.value));
              }}
            />
            {opt.value}
          </label>
        );
      })}
    </div>
  );
}

export function ProductAttributeFields({
  catalogAttributes,
  rows,
  onChange,
}: {
  catalogAttributes: CatalogAttribute[];
  rows: ProductAttributeRow[];
  onChange: (rows: ProductAttributeRow[]) => void;
}) {
  const t = useTranslations("products");

  const usedIds = new Set(rows.map((r) => r.attributeId));
  const available = catalogAttributes.filter((a) => !usedIds.has(a.id));

  const addRow = (attributeId: string) => {
    const attr = catalogAttributes.find((a) => a.id === attributeId);
    if (!attr) return;
    onChange([...rows, { attributeId: attr.id, name: attr.name, values: [] }]);
  };

  const updateValues = (index: number, values: string[]) => {
    const next = [...rows];
    next[index] = { ...next[index], values };
    onChange(next);
  };

  const removeRow = (index: number) => {
    onChange(rows.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col gap-4">
      {rows.map((row, index) => (
        <div
          key={row.attributeId}
          className="flex flex-col gap-3 rounded-lg border border-border bg-muted/20 p-4"
        >
          <div className="flex items-center justify-between gap-2">
            <Label className="text-base font-medium">{row.name}</Label>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => removeRow(index)}
              aria-label={t("form.attributes.removeAttribute")}
            >
              <Trash2 className="size-4 text-destructive" />
            </Button>
          </div>
          <AttributeValuePicker
            attributeId={row.attributeId}
            selected={row.values}
            onChange={(values) => updateValues(index, values)}
          />
        </div>
      ))}

      {available.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <Select onValueChange={addRow}>
            <SelectTrigger className="h-10 w-full max-w-xs">
              <SelectValue placeholder={t("form.attributes.selectAttribute")} />
            </SelectTrigger>
            <SelectContent>
              {available.map((attr) => (
                <SelectItem key={attr.id} value={attr.id}>
                  {attr.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0"
            disabled={available.length === 0}
            onClick={() => available[0] && addRow(available[0].id)}
          >
            <Plus className="me-1 size-4" />
            {t("form.attributes.addAttribute")}
          </Button>
        </div>
      )}
    </div>
  );
}
