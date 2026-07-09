"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { PageHeader } from "@/components/shared/page-elements";
import { PageTransition } from "@/components/shared/page-transition";
import { FormField } from "@/components/shared/form-field";
import { DataTable } from "@/components/tables/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getNavigation, isTemporaryId, updateNavigation } from "@/services/storefront.service";
import type { NavItem } from "@/types/api/storefront";

interface MenuForm {
  id?: string;
  label: string;
  url: string;
  sort_order: number;
}

export default function NavigationPage() {
  const t = useTranslations("context.navigation");
  const tp = useTranslations("pages");
  const tc = useTranslations("common");
  const queryClient = useQueryClient();

  const [items, setItems] = useState<NavItem[]>([]);
  const [form, setForm] = useState<MenuForm | null>(null);
  const [open, setOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["navigation"],
    queryFn: getNavigation,
  });

  useEffect(() => {
    if (data) {
      setItems(data.map((item, idx) => ({ ...item, sort_order: item.sort_order ?? idx })));
    }
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: () => updateNavigation(items),
    onSuccess: (saved) => {
      setItems(saved);
      queryClient.invalidateQueries({ queryKey: ["navigation"] });
      toast.success(t("saved"));
    },
    onError: () => toast.error(t("saveFailed")),
  });

  const openAdd = () => {
    setForm({ label: "", url: "", sort_order: items.length + 1 });
    setOpen(true);
  };

  const openEdit = (item: NavItem) => {
    setForm({
      id: item.id,
      label: item.label,
      url: item.url,
      sort_order: item.sort_order ?? 0,
    });
    setOpen(true);
  };

  const saveItem = () => {
    if (!form) return;
    const entry: NavItem = {
      id: form.id ?? String(Date.now()),
      label: form.label.trim(),
      url: form.url.trim(),
      sort_order: form.sort_order,
      is_active: true,
    };
    if (!entry.label || !entry.url) return;

    setItems((prev) => {
      const exists = prev.find((i) => i.id === entry.id);
      if (exists) return prev.map((i) => (i.id === entry.id ? entry : i)).sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
      return [...prev, entry].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
    });
    setOpen(false);
    setForm(null);
  };

  const deleteItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const columns: ColumnDef<NavItem>[] = [
    { accessorKey: "label", header: t("label") },
    { accessorKey: "url", header: t("href") },
    { accessorKey: "sort_order", header: t("order") },
    {
      id: "actions",
      header: tc("actions"),
      cell: ({ row }) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={() => openEdit(row.original)}>
            <Pencil className="size-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => deleteItem(row.original.id!)}>
            <Trash2 className="size-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <PageTransition>
      <PageHeader
        title={tp("titles.navigationSettings")}
        description={t("description")}
        action={
          <Button onClick={openAdd} className="shadow-elevated-sm">
            <Plus className="me-2 size-4" />
            {t("addMenuItem")}
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={items}
        isLoading={isLoading}
        searchKey="label"
        searchPlaceholder={t("labelPlaceholder")}
      />

      <div className="mt-4">
        <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
          {saveMutation.isPending ? tc("loading") : t("save")}
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {form?.id && !isTemporaryId(form.id) ? tc("edit") : t("addMenuItem")}
            </DialogTitle>
          </DialogHeader>
          {form && (
            <div className="flex flex-col gap-4">
              <FormField label={t("label")} htmlFor="nav-label" required>
                <Input
                  id="nav-label"
                  value={form.label}
                  onChange={(e) => setForm({ ...form, label: e.target.value })}
                  placeholder={t("labelPlaceholder")}
                />
              </FormField>
              <FormField label={t("href")} htmlFor="nav-url" required>
                <Input
                  id="nav-url"
                  value={form.url}
                  onChange={(e) => setForm({ ...form, url: e.target.value })}
                  placeholder={t("hrefPlaceholder")}
                />
              </FormField>
              <FormField label={t("order")} htmlFor="nav-order">
                <Input
                  id="nav-order"
                  type="number"
                  value={form.sort_order}
                  onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
                />
              </FormField>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              {tc("cancel")}
            </Button>
            <Button onClick={saveItem}>{tc("save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageTransition>
  );
}
