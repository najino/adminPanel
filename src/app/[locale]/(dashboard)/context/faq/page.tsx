"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { ChevronDown, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/shared/page-elements";
import { PageTransition } from "@/components/shared/page-transition";
import { FormField } from "@/components/shared/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
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
import { cn } from "@/lib/utils";
import {
  createFaqItem,
  deleteFaqItem,
  getFaqItems,
  isTemporaryId,
  updateFaqItem,
} from "@/services/storefront.service";
import type { FaqItem } from "@/types/api/storefront";

interface FaqForm {
  id?: string;
  question: string;
  answer: string;
}

const emptyForm = (): FaqForm => ({ question: "", answer: "" });

export default function FaqPage() {
  const t = useTranslations("context.faq");
  const tp = useTranslations("pages");
  const tc = useTranslations("common");
  const queryClient = useQueryClient();

  const [openId, setOpenId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<FaqForm>(emptyForm);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["faq-items"],
    queryFn: getFaqItems,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["faq-items"] });

  const createMutation = useMutation({
    mutationFn: createFaqItem,
    onSuccess: () => {
      invalidate();
      setDialogOpen(false);
      setForm(emptyForm());
      toast.success(t("created"));
    },
    onError: () => toast.error(t("saveFailed")),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof updateFaqItem>[1] }) =>
      updateFaqItem(id, payload),
    onSuccess: () => {
      invalidate();
      setDialogOpen(false);
      setForm(emptyForm());
      toast.success(t("updated"));
    },
    onError: () => toast.error(t("saveFailed")),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteFaqItem,
    onSuccess: () => {
      invalidate();
      setDeleteId(null);
      toast.success(t("deleted"));
    },
    onError: () => toast.error(t("saveFailed")),
  });

  const openAdd = () => {
    setForm(emptyForm());
    setDialogOpen(true);
  };

  const openEdit = (item: FaqItem) => {
    setForm({ id: item.id, question: item.question, answer: item.answer });
    setDialogOpen(true);
  };

  const handleSave = () => {
    const question = form.question.trim();
    const answer = form.answer.trim();
    if (!question || !answer) return;

    const payload = { question, answer, is_active: true };

    if (form.id && !isTemporaryId(form.id)) {
      updateMutation.mutate({ id: form.id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <PageTransition>
      <PageHeader
        title={tp("titles.faqSettings")}
        description={t("itemsDescription")}
        action={
          <Button onClick={openAdd} className="shadow-elevated-sm">
            <Plus className="me-2 size-4" />
            {t("addItem")}
          </Button>
        }
      />

      {isLoading ? (
        <p className="text-sm text-muted-foreground">{tc("loading")}</p>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((item, index) => (
            <Card key={item.id}>
              <button
                type="button"
                className="flex w-full items-center justify-between px-6 py-4 text-start"
                onClick={() => setOpenId(openId === item.id ? null : item.id)}
              >
                <span className="font-medium">{item.question || `${t("item")} ${index + 1}`}</span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEdit(item);
                    }}
                  >
                    {tc("edit")}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteId(item.id);
                    }}
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                  <ChevronDown
                    className={cn("size-4 transition-transform", openId === item.id && "rotate-180")}
                  />
                </div>
              </button>
              {openId === item.id && (
                <CardContent className="border-t border-border pt-4">
                  <p className="whitespace-pre-wrap text-sm text-muted-foreground">{item.answer}</p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{form.id && !isTemporaryId(form.id) ? tc("edit") : t("addItem")}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <FormField label={t("question")} htmlFor="faq-question" required>
              <Input
                id="faq-question"
                value={form.question}
                onChange={(e) => setForm((p) => ({ ...p, question: e.target.value }))}
                placeholder={t("questionPlaceholder")}
              />
            </FormField>
            <FormField label={t("answer")} htmlFor="faq-answer" required>
              <Textarea
                id="faq-answer"
                value={form.answer}
                onChange={(e) => setForm((p) => ({ ...p, answer: e.target.value }))}
                placeholder={t("answerPlaceholder")}
                rows={4}
              />
            </FormField>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {tc("cancel")}
            </Button>
            <Button
              onClick={handleSave}
              disabled={!form.question.trim() || !form.answer.trim() || isSaving}
            >
              {isSaving ? tc("loading") : tc("save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("deleteDescription")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tc("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
