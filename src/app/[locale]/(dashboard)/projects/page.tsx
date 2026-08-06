"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { ColumnDef } from "@tanstack/react-table";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-elements";
import { PageTransition } from "@/components/shared/page-transition";
import { FilterBar } from "@/components/shared/filter-bar";
import { TableRowActions } from "@/components/shared/table-row-actions";
import { DataTable } from "@/components/tables/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  deleteAdminProject,
  getAdminProjectCategories,
  getAdminProjects,
} from "@/services/project.service";
import { describeApiError } from "@/lib/api-error";
import type { AdminProject } from "@/types/api/projects";

export default function ProjectsPage() {
  const t = useTranslations("projects");
  const tp = useTranslations("pages");
  const tc = useTranslations("common");
  const tApi = useTranslations("common.apiErrors");
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: categories = [] } = useQuery({
    queryKey: ["project-categories"],
    queryFn: getAdminProjectCategories,
  });

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["projects", search, categoryId],
    queryFn: () =>
      getAdminProjects({
        q: search.trim() || undefined,
        category_id: categoryId === "all" ? undefined : categoryId,
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAdminProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setDeleteId(null);
      toast.success(t("deleteSuccess"));
    },
    onError: (err: Error) => {
      const { title, description } = describeApiError(err, tApi, "unexpected");
      toast.error(title, description ? { description } : undefined);
    },
  });

  const columns: ColumnDef<AdminProject>[] = [
    {
      accessorKey: "title",
      header: t("table.columns.title"),
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          {row.original.image && (
            <img
              src={row.original.image}
              alt=""
              className="size-10 rounded-lg object-cover ring-1 ring-border"
            />
          )}
          <div className="min-w-0">
            <p className="truncate font-medium">{row.original.title}</p>
            <p className="truncate text-xs text-muted-foreground">{row.original.slug}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "category_title",
      header: t("table.columns.category"),
      cell: ({ row }) => row.original.category_title || "—",
    },
    {
      accessorKey: "location",
      header: t("table.columns.location"),
      cell: ({ row }) => row.original.location || "—",
    },
    {
      accessorKey: "implementation_year",
      header: t("table.columns.year"),
      cell: ({ row }) => (
        <span className="tabular-nums">{row.original.implementation_year ?? "—"}</span>
      ),
    },
    {
      id: "actions",
      header: t("table.columns.actions"),
      cell: ({ row }) => (
        <TableRowActions
          actions={[
            {
              label: tc("edit"),
              icon: Pencil,
              href: `/projects/${row.original.id}/edit`,
            },
            {
              label: tc("delete"),
              icon: Trash2,
              variant: "destructive",
              onClick: () => setDeleteId(row.original.id),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <PageTransition>
      <PageHeader
        title={tp("titles.allProjects")}
        action={
          <Button asChild>
            <Link href="/projects/create">
              <Plus className="me-2 h-4 w-4" />
              {t("addButton")}
            </Link>
          </Button>
        }
      />

      <FilterBar>
        <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
          <Search
            className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            placeholder={t("filters.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 ps-9"
          />
        </div>
        <Select value={categoryId} onValueChange={setCategoryId}>
          <SelectTrigger className="h-10 w-full sm:w-44">
            <SelectValue placeholder={t("filters.allCategories")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("filters.allCategories")}</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterBar>

      <DataTable
        columns={columns}
        data={projects}
        isLoading={isLoading}
        emptyTitle={t("empty")}
      />

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
