"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { PageHeader } from "@/components/shared/page-elements";
import { PageTransition } from "@/components/shared/page-transition";
import { DataTable } from "@/components/tables/data-table";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { deleteContactMessage, getContactMessages } from "@/services/data.service";
import type { ContactMessage } from "@/types";

export default function ContactPage() {
  const t = useTranslations("contact");
  const tp = useTranslations("pages");
  const tc = useTranslations("common");
  const queryClient = useQueryClient();
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const [reply, setReply] = useState("");

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["contact-messages"],
    queryFn: getContactMessages,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteContactMessage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contact-messages"] });
      setDeleteTarget(null);
      setSelected(null);
      toast.success(tc("delete"));
    },
    onError: () => toast.error(tc("saveFailed")),
  });

  const columns: ColumnDef<ContactMessage>[] = [
    { accessorKey: "name", header: t("table.columns.name") },
    { accessorKey: "email", header: t("table.columns.email") },
    { accessorKey: "subject", header: t("table.columns.subject") },
    { accessorKey: "date", header: t("table.columns.date") },
    {
      id: "actions",
      header: t("table.columns.actions"),
      cell: ({ row }) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={() => setSelected(row.original)}>
            {t("table.viewMessage")}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(row.original.id)}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  const handleReply = () => {
    if (!reply.trim()) return;
    toast.success(tc("save"));
    setReply("");
  };

  return (
    <PageTransition>
      <PageHeader title={tp("titles.allContactComments")} />
      <DataTable
        columns={columns}
        data={messages}
        searchKey="subject"
        isLoading={isLoading}
      />

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("modal.title")}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="flex flex-col gap-4">
              <div className="grid gap-2 text-sm">
                <p><strong>{t("modal.fields.name")}:</strong> {selected.name}</p>
                <p><strong>{t("modal.fields.email")}:</strong> {selected.email}</p>
                <p><strong>{t("modal.fields.subject")}:</strong> {selected.subject}</p>
                <p><strong>{t("modal.fields.date")}:</strong> {selected.date}</p>
                <p><strong>{t("modal.fields.message")}:</strong> {selected.message}</p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Reply</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <div className="flex flex-col gap-2">
                    <Label>Reply message</Label>
                    <Textarea value={reply} onChange={(e) => setReply(e.target.value)} rows={4} />
                  </div>
                  <Button onClick={handleReply}>{tc("save")}</Button>
                </CardContent>
              </Card>
            </div>
          )}
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
