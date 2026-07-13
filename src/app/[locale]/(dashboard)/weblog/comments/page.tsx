"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Check, X, Trash2, Mail, MailOpen, MessageSquareReply } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { PageHeader, StatusBadge } from "@/components/shared/page-elements";
import { PageTransition } from "@/components/shared/page-transition";
import { DataTable } from "@/components/tables/data-table";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { deleteComment, getComments, replyToComment, updateComment } from "@/services/data.service";
import { formatDate } from "@/lib/utils";
import type { BlogComment } from "@/types";

export default function WeblogCommentsPage() {
  const t = useTranslations("posts");
  const tp = useTranslations("pages");
  const ts = useTranslations("common.status");
  const tc = useTranslations("common");
  const queryClient = useQueryClient();
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [replyTarget, setReplyTarget] = useState<BlogComment | null>(null);
  const [replyText, setReplyText] = useState("");

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
    onError: () => toast.error(tc("saveFailed")),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments"] });
      setDeleteTarget(null);
      toast.success(tc("delete"));
    },
    onError: () => toast.error(tc("saveFailed")),
  });

  const replyMutation = useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) => replyToComment(id, content),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["comments"] });
      setReplyTarget(updated);
      setReplyText("");
      toast.success(t("commentModal.replySent"));
    },
    onError: () => toast.error(tc("saveFailed")),
  });

  const openReply = (comment: BlogComment) => {
    setReplyTarget(comment);
    setReplyText("");
  };

  const closeReply = () => {
    setReplyTarget(null);
    setReplyText("");
  };

  const handleSendReply = () => {
    if (!replyTarget || !replyText.trim()) return;
    replyMutation.mutate({ id: replyTarget.id, content: replyText });
  };

  const columns: ColumnDef<BlogComment>[] = [
    { accessorKey: "author", header: t("commentsTable.columns.user") },
    { accessorKey: "postTitle", header: t("commentsTable.columns.post") },
    {
      accessorKey: "content",
      header: t("commentsTable.columns.comment"),
      cell: ({ row }) => <span className="line-clamp-1">{row.original.content}</span>,
    },
    {
      id: "replies",
      header: t("commentsTable.columns.replies"),
      cell: ({ row }) => (
        <span className="text-muted-foreground tabular-nums">
          {row.original.replies?.length ?? 0}
        </span>
      ),
    },
    {
      accessorKey: "date",
      header: t("commentsTable.columns.date"),
      cell: ({ row }) => (
        <span className="tabular-nums text-muted-foreground">{formatDate(row.original.date)}</span>
      ),
    },
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
            title={t("commentsTable.replyComment")}
            onClick={() => openReply(row.original)}
          >
            <MessageSquareReply className="h-4 w-4 text-primary" />
          </Button>
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

      <Dialog open={!!replyTarget} onOpenChange={(open) => !open && closeReply()}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("commentModal.title")}</DialogTitle>
          </DialogHeader>
          {replyTarget && (
            <div className="flex flex-col gap-4">
              <div className="grid gap-2 rounded-lg border bg-muted/40 p-3 text-sm">
                <p>
                  <span className="text-muted-foreground">{t("commentsTable.columns.user")}: </span>
                  {replyTarget.author}
                </p>
                <p>
                  <span className="text-muted-foreground">{t("commentsTable.columns.post")}: </span>
                  {replyTarget.postTitle}
                </p>
                <p className="leading-relaxed">{replyTarget.content}</p>
              </div>

              <div className="flex flex-col gap-2">
                <Label>{t("commentModal.tabs.replies")}</Label>
                {(replyTarget.replies?.length ?? 0) === 0 ? (
                  <p className="text-sm text-muted-foreground">{t("commentModal.noReplies")}</p>
                ) : (
                  <ul className="flex max-h-48 flex-col gap-2 overflow-y-auto scrollbar-premium">
                    {replyTarget.replies?.map((reply) => (
                      <li
                        key={reply.id}
                        className="rounded-lg border border-primary/15 bg-primary/5 p-3 text-sm"
                      >
                        <div className="mb-1 flex items-center justify-between gap-2 text-xs text-muted-foreground">
                          <span>{reply.author}</span>
                          <span>{formatDate(reply.date)}</span>
                        </div>
                        <p>{reply.content}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="comment-reply">{t("commentsTable.replyComment")}</Label>
                <Textarea
                  id="comment-reply"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={t("commentModal.replyPlaceholder")}
                  rows={4}
                />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={closeReply}>
              {t("commentModal.close")}
            </Button>
            <Button
              onClick={handleSendReply}
              disabled={!replyText.trim() || replyMutation.isPending}
            >
              {t("commentModal.send")}
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
