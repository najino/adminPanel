"use client";

import { useState } from "react";
import { useContextSection } from "@/hooks/use-context-section";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { ChevronDown, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/shared/page-elements";
import { PageTransition } from "@/components/shared/page-transition";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { updateContextSection } from "@/services/data.service";

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export default function FaqPage() {
  const t = useTranslations("context.faq");
  const tp = useTranslations("pages");
  const tc = useTranslations("common");
  const queryClient = useQueryClient();
  const { state: items, setState: setItems } = useContextSection<FaqItem[]>("faq", []);
  const [openId, setOpenId] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => updateContextSection("faq", items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["context", "faq"] });
      toast.success(tc("save"));
    },
  });

  const addItem = () => {
    const id = String(Date.now());
    setItems((prev) => [...prev, { id, question: "", answer: "" }]);
    setOpenId(id);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateItem = (id: string, field: keyof FaqItem, value: string) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  return (
    <PageTransition>
      <PageHeader
        title={tp("titles.faqSettings")}
        description={t("itemsDescription")}
        action={
          <Button onClick={addItem}>
            <Plus className="me-2 h-4 w-4" />
            {t("addItem")}
          </Button>
        }
      />

      <div className="space-y-3">
        {items.map((item, index) => (
          <Card key={item.id}>
            <button
              type="button"
              className="flex w-full items-center justify-between px-6 py-4 text-start"
              onClick={() => setOpenId(openId === item.id ? null : item.id)}
            >
              <span className="font-medium">
                {item.question || `${t("item")} ${index + 1}`}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeItem(item.id);
                  }}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
                <ChevronDown
                  className={cn("h-4 w-4 transition-transform", openId === item.id && "rotate-180")}
                />
              </div>
            </button>
            {openId === item.id && (
              <CardContent className="space-y-4 border-t border-border pt-4">
                <div className="space-y-2">
                  <Label>{t("question")}</Label>
                  <Input
                    value={item.question}
                    onChange={(e) => updateItem(item.id, "question", e.target.value)}
                    placeholder={t("questionPlaceholder")}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("answer")}</Label>
                  <Textarea
                    value={item.answer}
                    onChange={(e) => updateItem(item.id, "answer", e.target.value)}
                    placeholder={t("answerPlaceholder")}
                  />
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      <div className="mt-4">
        <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
          {t("save")}
        </Button>
      </div>
    </PageTransition>
  );
}
