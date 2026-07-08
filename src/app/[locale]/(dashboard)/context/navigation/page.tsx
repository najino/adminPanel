"use client";

import { useState } from "react";
import { useContextSection } from "@/hooks/use-context-section";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { PageHeader } from "@/components/shared/page-elements";
import { PageTransition } from "@/components/shared/page-transition";
import { DataTable } from "@/components/tables/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { updateContextSection } from "@/services/data.service";

interface MenuItem {
  id: string;
  label: string;
  url: string;
  order: number;
}

export default function NavigationPage() {
  const t = useTranslations("context.navigation");
  const tp = useTranslations("pages");
  const tc = useTranslations("common");
  const queryClient = useQueryClient();
  const { state: items, setState: setItems } = useContextSection<MenuItem[]>("navigation", []);
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [open, setOpen] = useState(false);

  const mutation = useMutation({
    mutationFn: () => updateContextSection("navigation", items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["context", "navigation"] });
      toast.success(tc("save"));
    },
  });

  const openAdd = () => {
    setEditing({ id: String(Date.now()), label: "", url: "", order: items.length + 1 });
    setOpen(true);
  };

  const openEdit = (item: MenuItem) => {
    setEditing({ ...item });
    setOpen(true);
  };

  const saveItem = () => {
    if (!editing) return;
    setItems((prev) => {
      const exists = prev.find((i) => i.id === editing.id);
      if (exists) return prev.map((i) => (i.id === editing.id ? editing : i));
      return [...prev, editing].sort((a, b) => a.order - b.order);
    });
    setOpen(false);
    setEditing(null);
  };

  const deleteItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const columns: ColumnDef<MenuItem>[] = [
    { accessorKey: "label", header: t("label") },
    { accessorKey: "url", header: t("href") },
    { accessorKey: "order", header: "Order" },
    {
      id: "actions",
      header: tc("actions"),
      cell: ({ row }) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={() => openEdit(row.original)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => deleteItem(row.original.id)}>
            <Trash2 className="h-4 w-4 text-destructive" />
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
          <Button onClick={openAdd}>
            <Plus className="me-2 h-4 w-4" />
            {t("addMenuItem")}
          </Button>
        }
      />

      <DataTable columns={columns} data={items} searchKey="label" searchPlaceholder={t("labelPlaceholder")} />

      <div className="mt-4">
        <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
          {t("save")}
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing?.label ? tc("edit") : t("addMenuItem")}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t("label")}</Label>
                <Input
                  value={editing.label}
                  onChange={(e) => setEditing({ ...editing, label: e.target.value })}
                  placeholder={t("labelPlaceholder")}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("href")}</Label>
                <Input
                  value={editing.url}
                  onChange={(e) => setEditing({ ...editing, url: e.target.value })}
                  placeholder={t("hrefPlaceholder")}
                />
              </div>
              <div className="space-y-2">
                <Label>Order</Label>
                <Input
                  type="number"
                  value={editing.order}
                  onChange={(e) => setEditing({ ...editing, order: Number(e.target.value) })}
                />
              </div>
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
