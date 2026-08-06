"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { ColumnDef } from "@tanstack/react-table";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
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
import {
  createAdminProjectCategory,
  deleteAdminProjectCategory,
  getAdminProjectCategories,
  toProjectSlug,
  updateAdminProjectCategory,
} from "@/services/project.service";
import { describeApiError } from "@/lib/api-error";
import type { AdminProjectCategory } from "@/types/api/projects";

interface CategoryForm {
  id?: string;
  title: string;
  slug: string;
}

export default function ProjectCategoriesPage() {
  const t = useTranslations("projects");
  const tp = useTranslations("pages");
  const tc = useTranslations("common");
  const tApi = useTranslations("common.apiErrors");
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<CategoryForm>({ title: "", slug: "" });
  const [slugTouched, setSlugTouched] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["project-categories"],
    queryFn: getAdminProjectCategories,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const title = form.title.trim();
      const slug = (form.slug.trim() || toProjectSlug(title)).slice(0, 255);
      if (!title) throw new Error(t("categories.modal.nameRequired"));
      if (form.id) {
        return updateAdminProjectCategory(form.id, { title, slug });
      }
      return createAdminProjectCategory({ title, slug });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-categories"] });
      setOpen(false);
      setForm({ title: "", slug: "" });
      setSlugTouched(false);
      toast.success(tc("save"));
    },
    onError: (err: Error) => {
      const { title, description } = describeApiError(err, tApi, "validation");
      toast.error(title, description ? { description } : undefined);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAdminProjectCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-categories"] });
      setDeleteId(null);
      toast.success(tc("delete"));
    },
    onError: (err: Error) => {
      const { title, description } = describeApiError(err, tApi, "unexpected");
      toast.error(title, description ? { description } : undefined);
    },
  });

  const openCreate = () => {
    setForm({ title: "", slug: "" });
    setSlugTouched(false);
    setOpen(true);
  };

  const openEdit = (item: AdminProjectCategory) => {
    setForm({ id: item.id, title: item.title, slug: item.slug });
    setSlugTouched(true);
    setOpen(true);
  };

  const columns: ColumnDef<AdminProjectCategory>[] = [
    { accessorKey: "title", header: t("categories.columns.title") },
    { accessorKey: "slug", header: t("categories.columns.slug") },
    {
      id: "actions",
      header: tc("actions"),
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => openEdit(row.original)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDeleteId(row.original.id)}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <PageTransition>
      <PageHeader
        title={tp("titles.projectCategories")}
        action={
          <Button onClick={openCreate}>
            <Plus className="me-2 h-4 w-4" />
            {t("categories.addCategory")}
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={categories}
        isLoading={isLoading}
        emptyTitle={tc("noData")}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {form.id ? t("categories.modal.editTitle") : t("categories.modal.title")}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <FormField label={t("categories.modal.name")} htmlFor="cat-title" required>
              <Input
                id="cat-title"
                value={form.title}
                onChange={(e) => {
                  const title = e.target.value;
                  setForm((prev) => ({
                    ...prev,
                    title,
                    slug: slugTouched ? prev.slug : toProjectSlug(title),
                  }));
                }}
                placeholder={t("categories.modal.namePlaceholder")}
              />
            </FormField>
            <FormField label={t("categories.modal.slug")} htmlFor="cat-slug" required>
              <Input
                id="cat-slug"
                value={form.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setForm((prev) => ({ ...prev, slug: e.target.value }));
                }}
                placeholder={t("categories.modal.slugPlaceholder")}
              />
            </FormField>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              {t("categories.modal.cancel")}
            </Button>
            <Button
              onClick={() => saveMutation.mutate()}
              disabled={!form.title.trim() || saveMutation.isPending}
            >
              {t("categories.modal.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{tc("delete")}</AlertDialogTitle>
            <AlertDialogDescription>{tc("confirmDelete")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tc("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
            >
              {tc("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageTransition>
  );
}
