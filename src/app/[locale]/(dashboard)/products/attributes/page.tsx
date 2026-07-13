"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { motion, useReducedMotion } from "framer-motion";
import {
  Check,
  Hash,
  Layers,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { PageTransition } from "@/components/shared/page-transition";
import { EmptyState, PageHeader, StatCard } from "@/components/shared/page-elements";
import { FormField } from "@/components/shared/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn, slugify } from "@/lib/utils";
import {
  createCatalogAttribute,
  createCatalogAttributeValue,
  deleteCatalogAttribute,
  deleteCatalogAttributeValue,
  getCatalogAttributes,
  getCatalogAttributeValues,
  updateCatalogAttribute,
} from "@/services/product.service";
import type { CatalogAttribute } from "@/types/api/products";

export default function ProductAttributesPage() {
  const t = useTranslations("products.attributesPage");
  const tCommon = useTranslations("common");
  const queryClient = useQueryClient();
  const prefersReducedMotion = useReducedMotion();

  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newValue, setNewValue] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CatalogAttribute | null>(null);
  const [deleteValueId, setDeleteValueId] = useState<string | null>(null);

  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formSlugTouched, setFormSlugTouched] = useState(false);

  const { data: attributes = [], isLoading } = useQuery({
    queryKey: ["catalog-attributes"],
    queryFn: getCatalogAttributes,
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return attributes;
    return attributes.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        (a.slug ?? "").toLowerCase().includes(q),
    );
  }, [attributes, search]);

  const selected = attributes.find((a) => a.id === selectedId) ?? null;

  useEffect(() => {
    if (!selectedId && filtered.length > 0) {
      setSelectedId(filtered[0].id);
    }
    if (selectedId && !attributes.some((a) => a.id === selectedId)) {
      setSelectedId(filtered[0]?.id ?? null);
    }
  }, [attributes, filtered, selectedId]);

  const { data: values = [], isLoading: valuesLoading } = useQuery({
    queryKey: ["catalog-attribute-values", selectedId],
    queryFn: () => getCatalogAttributeValues(selectedId!),
    enabled: !!selectedId,
  });

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ["catalog-attributes"] });
    if (selectedId) {
      queryClient.invalidateQueries({ queryKey: ["catalog-attribute-values", selectedId] });
    }
  };

  const createMutation = useMutation({
    mutationFn: createCatalogAttribute,
    onSuccess: (attr) => {
      invalidateAll();
      setSelectedId(attr.id);
      setCreateOpen(false);
      resetForm();
      toast.success(t("attributeCreated"));
    },
    onError: () => toast.error(t("saveFailed")),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof updateCatalogAttribute>[1] }) =>
      updateCatalogAttribute(id, payload),
    onSuccess: () => {
      invalidateAll();
      setEditOpen(false);
      toast.success(t("attributeUpdated"));
    },
    onError: () => toast.error(t("saveFailed")),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCatalogAttribute,
    onSuccess: () => {
      invalidateAll();
      setDeleteTarget(null);
      toast.success(t("attributeDeleted"));
    },
    onError: () => toast.error(t("saveFailed")),
  });

  const addValueMutation = useMutation({
    mutationFn: (value: string) =>
      createCatalogAttributeValue({
        attribute_id: selectedId!,
        value,
        is_active: true,
        sort_order: values.length,
      }),
    onSuccess: () => {
      invalidateAll();
      setNewValue("");
      toast.success(t("valueAdded"));
    },
    onError: () => toast.error(t("saveFailed")),
  });

  const deleteValueMutation = useMutation({
    mutationFn: deleteCatalogAttributeValue,
    onSuccess: () => {
      invalidateAll();
      setDeleteValueId(null);
      toast.success(t("valueRemoved"));
    },
    onError: () => toast.error(t("saveFailed")),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      updateCatalogAttribute(id, { is_active }),
    onSuccess: () => {
      invalidateAll();
      toast.success(t("attributeUpdated"));
    },
    onError: () => toast.error(t("saveFailed")),
  });

  const resetForm = () => {
    setFormName("");
    setFormSlug("");
    setFormSlugTouched(false);
  };

  const openCreate = () => {
    resetForm();
    setCreateOpen(true);
  };

  const openEdit = (attr: CatalogAttribute) => {
    setFormName(attr.name);
    setFormSlug(attr.slug ?? "");
    setFormSlugTouched(true);
    setEditOpen(true);
  };

  const handleNameChange = (name: string, touched: boolean) => {
    setFormName(name);
    if (!touched) {
      setFormSlug(slugify(name));
    }
  };

  const activeCount = attributes.filter((a) => a.is_active !== false).length;

  const panelMotion = prefersReducedMotion
    ? {}
    : { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.2 } };

  return (
    <PageTransition>
      <PageHeader
        title={t("pageTitle")}
        description={t("pageDescription")}
        action={
          <Button onClick={openCreate} className="shadow-elevated-sm">
            <Plus className="me-2 size-4" aria-hidden />
            {t("addAttribute")}
          </Button>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard title={t("stats.total")} value={String(attributes.length)} icon={Layers} isLoading={isLoading} />
        <StatCard title={t("stats.active")} value={String(activeCount)} icon={Sparkles} isLoading={isLoading} />
        <StatCard
          title={t("stats.values")}
          value={selected ? String(values.length) : "—"}
          icon={Tag}
          isLoading={isLoading || (!!selectedId && valuesLoading)}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(280px,340px)_1fr]">
        {/* Attribute list */}
        <section className="flex flex-col overflow-hidden rounded-xl border border-border/70 bg-card/80 shadow-elevated-sm backdrop-blur-sm">
          <div className="border-b border-border/60 p-4">
            <div className="relative">
              <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("searchPlaceholder")}
                className="h-10 ps-9"
                aria-label={t("searchPlaceholder")}
              />
            </div>
          </div>

          <div className="flex max-h-[min(70vh,560px)] flex-col gap-1 overflow-y-auto p-2">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))
            ) : filtered.length === 0 ? (
              <div className="p-4">
                <EmptyState
                  title={t("emptyTitle")}
                  description={t("emptyDescription")}
                  icon={Layers}
                />
                <Button onClick={openCreate} variant="outline" className="mt-4 w-full">
                  <Plus className="me-2 size-4" />
                  {t("addAttribute")}
                </Button>
              </div>
            ) : (
              filtered.map((attr) => {
                const isSelected = attr.id === selectedId;
                return (
                  <button
                    key={attr.id}
                    type="button"
                    onClick={() => setSelectedId(attr.id)}
                    className={cn(
                      "group relative flex w-full flex-col gap-1 rounded-lg border px-3 py-3 text-start transition-all duration-150",
                      isSelected
                        ? "border-primary/30 bg-primary/5 shadow-elevated-sm"
                        : "border-transparent hover:border-border hover:bg-muted/40",
                    )}
                  >
                    {isSelected && (
                      <span className="absolute inset-y-2 start-0 w-0.5 rounded-full bg-primary" aria-hidden />
                    )}
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium">{attr.name}</span>
                      <span
                        className={cn(
                          "size-2 shrink-0 rounded-full",
                          attr.is_active !== false ? "bg-success" : "bg-muted-foreground/40",
                        )}
                        title={attr.is_active !== false ? t("active") : t("inactive")}
                      />
                    </div>
                    {attr.slug && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Hash className="size-3" aria-hidden />
                        {attr.slug}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </section>

        {/* Detail panel */}
        <motion.section
          key={selectedId ?? "empty"}
          {...panelMotion}
          className="flex min-h-[420px] flex-col overflow-hidden rounded-xl border border-border/70 bg-card shadow-elevated-sm"
        >
          {!selected ? (
            <div className="flex flex-1 items-center justify-center p-8">
              <EmptyState
                title={t("selectAttribute")}
                description={t("selectAttributeHint")}
                icon={Tag}
              />
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border/60 p-5">
                <div className="flex min-w-0 flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold tracking-tight">{selected.name}</h2>
                    <Badge variant={selected.is_active !== false ? "success" : "secondary"}>
                      {selected.is_active !== false ? t("active") : t("inactive")}
                    </Badge>
                  </div>
                  {selected.slug && (
                    <p className="text-sm text-muted-foreground">
                      <span className="font-mono text-xs">{selected.slug}</span>
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-2 rounded-lg border border-border/70 px-3 py-1.5">
                    <span className="text-xs text-muted-foreground">{t("active")}</span>
                    <Switch
                      checked={selected.is_active !== false}
                      onCheckedChange={(checked) =>
                        toggleActiveMutation.mutate({ id: selected.id, is_active: checked })
                      }
                      disabled={toggleActiveMutation.isPending}
                      aria-label={t("active")}
                    />
                  </div>
                  <Button variant="outline" size="sm" onClick={() => openEdit(selected)}>
                    <Pencil className="size-3.5" aria-hidden />
                    <span className="sr-only">{t("editAttribute")}</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setDeleteTarget(selected)}
                  >
                    <Trash2 className="size-3.5" aria-hidden />
                    <span className="sr-only">{t("deleteAttribute")}</span>
                  </Button>
                </div>
              </div>

              <div className="flex flex-1 flex-col gap-5 p-5">
                <div>
                  <h3 className="mb-1 text-sm font-medium">{t("valuesTitle")}</h3>
                  <p className="text-sm text-muted-foreground">{t("valuesDescription")}</p>
                </div>

                <form
                  className="flex gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const v = newValue.trim();
                    if (!v || addValueMutation.isPending) return;
                    addValueMutation.mutate(v);
                  }}
                >
                  <Input
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    placeholder={t("addValuePlaceholder")}
                    className="h-10 flex-1"
                    disabled={addValueMutation.isPending}
                  />
                  <Button
                    type="submit"
                    disabled={!newValue.trim() || addValueMutation.isPending}
                    className="h-10 shrink-0"
                  >
                    <Plus className="me-1.5 size-4" />
                    {addValueMutation.isPending ? tCommon("loading") : t("addValue")}
                  </Button>
                </form>

                {valuesLoading ? (
                  <div className="flex flex-wrap gap-2">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <Skeleton key={i} className="h-8 w-20 rounded-full" />
                    ))}
                  </div>
                ) : values.length === 0 ? (
                  <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-border/80 bg-muted/20 px-6 py-10 text-center">
                    <Tag className="mb-3 size-8 text-muted-foreground/60" aria-hidden />
                    <p className="text-sm font-medium">{t("noValues")}</p>
                    <p className="mt-1 max-w-xs text-xs text-muted-foreground">{t("noValuesHint")}</p>
                  </div>
                ) : (
                  <ul className="flex flex-wrap gap-2" role="list">
                    {values.map((val) => (
                      <li key={val.id}>
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-background px-3 py-1.5 text-sm font-medium shadow-elevated-sm transition-colors",
                            val.is_active === false && "opacity-50",
                          )}
                        >
                          <Check className="size-3 text-success" aria-hidden />
                          {val.value}
                          <button
                            type="button"
                            onClick={() => setDeleteValueId(val.id)}
                            className="ms-0.5 rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                            aria-label={`${tCommon("delete")} ${val.value}`}
                          >
                            <X className="size-3.5" />
                          </button>
                        </span>
                      </li>
                    ))}
                  </ul>
                )}

                <p className="mt-auto text-xs text-muted-foreground">{t("valuesCount", { count: values.length })}</p>
              </div>
            </>
          )}
        </motion.section>
      </div>

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("modal.createTitle")}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <FormField label={t("modal.name")} htmlFor="attr-name" required>
              <Input
                id="attr-name"
                value={formName}
                onChange={(e) => handleNameChange(e.target.value, formSlugTouched)}
                placeholder={t("modal.namePlaceholder")}
                className="h-10"
                autoFocus
              />
            </FormField>
            <FormField label={t("slug")} htmlFor="attr-slug" helper={t("slugHelper")}>
              <Input
                id="attr-slug"
                value={formSlug}
                onChange={(e) => {
                  setFormSlugTouched(true);
                  setFormSlug(e.target.value);
                }}
                placeholder="color"
                className="h-10 font-mono text-sm"
              />
            </FormField>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              {tCommon("cancel")}
            </Button>
            <Button
              onClick={() =>
                formName.trim() &&
                createMutation.mutate({
                  name: formName.trim(),
                  slug: formSlug.trim() || slugify(formName),
                  is_active: true,
                })
              }
              disabled={!formName.trim() || createMutation.isPending}
            >
              {createMutation.isPending ? tCommon("loading") : t("modal.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("editAttribute")}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <FormField label={t("modal.name")} htmlFor="edit-attr-name" required>
              <Input
                id="edit-attr-name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="h-10"
              />
            </FormField>
            <FormField label={t("slug")} htmlFor="edit-attr-slug" helper={t("slugHelper")}>
              <Input
                id="edit-attr-slug"
                value={formSlug}
                onChange={(e) => setFormSlug(e.target.value)}
                className="h-10 font-mono text-sm"
              />
            </FormField>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              {tCommon("cancel")}
            </Button>
            <Button
              onClick={() =>
                selected &&
                formName.trim() &&
                updateMutation.mutate({
                  id: selected.id,
                  payload: {
                    name: formName.trim(),
                    slug: formSlug.trim() || slugify(formName),
                  },
                })
              }
              disabled={!formName.trim() || updateMutation.isPending}
            >
              {updateMutation.isPending ? tCommon("loading") : tCommon("save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete attribute */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteAttribute")}</AlertDialogTitle>
            <AlertDialogDescription>{t("deleteAttributeConfirm")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tCommon("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
            >
              {tCommon("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete value */}
      <AlertDialog open={!!deleteValueId} onOpenChange={() => setDeleteValueId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{tCommon("delete")}</AlertDialogTitle>
            <AlertDialogDescription>{t("deleteValueConfirm")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tCommon("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteValueId && deleteValueMutation.mutate(deleteValueId)}
            >
              {tCommon("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageTransition>
  );
}
