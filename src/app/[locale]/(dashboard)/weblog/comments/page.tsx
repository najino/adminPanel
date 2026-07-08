"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Check, X, Trash2, Mail, MailOpen } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { PageHeader, StatusBadge } from "@/components/shared/page-elements";
import { PageTransition } from "@/components/shared/page-transition";
import { DataTable } from "@/components/tables/data-table";
import { Button } from "@/components/ui/button";
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
import { deleteComment, getComments, updateComment } from "@/services/data.service";
import type { BlogComment } from "@/types";
import { useState } from "react";

export default function WeblogCommentsPage() {
  const t = useTranslations("posts");
  const tp = useTranslations("pages");
  const ts = useTranslations("common.status");
  const tc = useTranslations("common");
  const queryClient = useQueryClient();
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ["comments"],
    queryFn: getComments,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<BlogComment> }) =>
      updateComment(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments"] });
      toast.success(tc("save"));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments"] });
      setDeleteTarget(null);
      toast.success(tc("delete"));
    },
  });

  const columns: ColumnDef<BlogComment>[] = [
    { accessorKey: "author", header: t("commentsTable.columns.user") },
    { accessorKey: "postTitle", header: t("commentsTable.columns.post") },
    {
      accessorKey: "content",
      header: t("commentsTable.columns.comment"),
      cell: ({ row }) => <span className="line-clamp-1">{row.original.content}</span>,
    },
    { accessorKey: "date", header: t("commentsTable.columns.date") },
    {
      accessorKey: "status",
      header: t("commentsTable.columns.status"),
      cell: ({ row }) => <StatusBadge status={row.original.status} label={ts(row.original.status)} />,
    },
    {
      id: "read",
      header: ts("read"),
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => updateMutation.mutate({ id: row.original.id, updates: { read: !row.original.read } })}
        >
          {row.original.read ? (
            <MailOpen className="h-4 w-4 text-muted-foreground" />
          ) : (
            <Mail className="h-4 w-4 text-primary" />
          )}
        </Button>
      ),
    },
    {
      id: "actions",
      header: tc("actions"),
      cell: ({ row }) => (
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => updateMutation.mutate({ id: row.original.id, updates: { status: "approved" } })}
          >
            <Check className="h-4 w-4 text-success" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => updateMutation.mutate({ id: row.original.id, updates: { status: "rejected" } })}
          >
            <X className="h-4 w-4 text-destructive" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(row.original.id)}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <PageTransition>
      <PageHeader title={tp("titles.allPostsComments")} />
      <DataTable
        columns={columns}
        data={comments}
        searchKey="content"
        searchPlaceholder={t("commentFilters.searchPlaceholder")}
        isLoading={isLoading}
      />

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
