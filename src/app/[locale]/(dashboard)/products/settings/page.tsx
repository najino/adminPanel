"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { ColumnDef } from "@tanstack/react-table";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageTransition } from "@/components/shared/page-transition";
import { PageHeader } from "@/components/shared/page-elements";
import { DataTable } from "@/components/tables/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { getCategories, createCategory, deleteCategory } from "@/services/data.service";
import { describeApiError } from "@/lib/api-error";
import type { Category } from "@/types";

export default function ProductSettingsPage() {
  const t = useTranslations("products");
  const tCommon = useTranslations("common");
  const tApi = useTranslations("common.apiErrors");
  const queryClient = useQueryClient();

  const [newCategory, setNewCategory] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setNewCategory("");
      setDialogOpen(false);
      toast.success(t("categories.modal.createSuccess"));
    },
    onError: (err: Error) => {
      const { title, description } = describeApiError(err, tApi, "validation");
      toast.error(title, description ? { description } : undefined);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setDeleteId(null);
      toast.success(t("categories.modal.deleteSuccess"));
    },
    onError: (err: Error) => {
      const { title, description } = describeApiError(err, tApi, "unexpected");
      toast.error(title, description ? { description } : undefined);
    },
  });

  const handleCreate = () => {
    const name = newCategory.trim();
    if (!name) {
      toast.error(t("categories.modal.nameRequired"));
      return;
    }
    createMutation.mutate(name);
  };

  const columns: ColumnDef<Category>[] = [
    {
      accessorKey: "name",
      header: t("categories.columns.category"),
    },
    {
      id: "products",
      header: t("categories.columns.products"),
      cell: () => "—",
    },
    {
      id: "actions",
      header: t("categories.columns.actions"),
      cell: ({ row }) => (
        <Button variant="ghost" size="sm" onClick={() => setDeleteId(row.original.id)}>
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      ),
    },
  ];

  return (
    <PageTransition>
      <PageHeader
        title={t("productSettingsTitle")}
        action={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-1 h-4 w-4" />
                {t("categories.addCategory")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("categories.modal.title")}</DialogTitle>
              </DialogHeader>
              <Input
                placeholder={t("categories.modal.placeholder")}
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleCreate();
                  }
                }}
              />
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  {t("categories.modal.cancel")}
                </Button>
                <Button
                  onClick={handleCreate}
                  disabled={!newCategory.trim() || createMutation.isPending}
                >
                  {t("categories.modal.save")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <DataTable
        columns={columns}
        data={categories}
        isLoading={isLoading}
        emptyTitle={tCommon("noData")}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{tCommon("delete")}</AlertDialogTitle>
            <AlertDialogDescription>{tCommon("confirmDelete")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tCommon("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
            >
              {tCommon("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageTransition>
  );
}
