"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { PageHeader } from "@/components/shared/page-elements";
import { PageTransition } from "@/components/shared/page-transition";
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
import { createPostCategory, deletePostCategory, getPostCategories } from "@/services/data.service";

export default function WeblogSettingsPage() {
  const t = useTranslations("posts");
  const tp = useTranslations("pages");
  const tc = useTranslations("common");
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["post-categories"],
    queryFn: getPostCategories,
  });

  const createMutation = useMutation({
    mutationFn: createPostCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["post-categories"] });
      setOpen(false);
      setNewCategory("");
      toast.success(tc("save"));
    },
    onError: () => toast.error(tc("saveFailed")),
  });

  const deleteMutation = useMutation({
    mutationFn: deletePostCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["post-categories"] });
      setDeleteTarget(null);
      toast.success(tc("delete"));
    },
    onError: () => toast.error(tc("saveFailed")),
  });

  const columns: ColumnDef<{ name: string }>[] = [
    { accessorKey: "name", header: t("categories.columns.category") },
    {
      id: "actions",
      header: tc("actions"),
      cell: ({ row }) => (
        <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(row.original.name)}>
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      ),
    },
  ];

  const tableData = categories.map((name) => ({ name }));

  return (
    <PageTransition>
      <PageHeader
        title={tp("titles.postSettings")}
        action={
          <Button onClick={() => setOpen(true)}>
            <Plus className="me-2 h-4 w-4" />
            {t("categories.addCategory")}
          </Button>
        }
      />
      <DataTable
        columns={columns}
        data={tableData}
        searchKey="name"
        isLoading={isLoading}
        emptyTitle={tc("noData")}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("categories.modal.title")}</DialogTitle>
          </DialogHeader>
          <Input
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder={t("categories.modal.placeholder")}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              {t("categories.modal.cancel")}
            </Button>
            <Button
              onClick={() => createMutation.mutate(newCategory)}
              disabled={!newCategory.trim() || createMutation.isPending}
            >
              {t("categories.modal.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{tc("delete")}</AlertDialogTitle>
            <AlertDialogDescription>{tc("confirmDelete")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tc("cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget)}>
              {tc("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageTransition>
  );
}
