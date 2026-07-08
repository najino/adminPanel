"use client";

import { useContextSection } from "@/hooks/use-context-section";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Check, X } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { PageHeader } from "@/components/shared/page-elements";
import { PageTransition } from "@/components/shared/page-transition";
import { DataTable } from "@/components/tables/data-table";
import { StatusBadge } from "@/components/shared/page-elements";
import { Button } from "@/components/ui/button";
import { updateContextSection } from "@/services/data.service";

interface Review {
  id: string;
  name: string;
  job: string;
  date: string;
  text: string;
  status: "approved" | "rejected" | "pending";
}

export default function CustomerReviewsPage() {
  const t = useTranslations("context.customerReviews");
  const tp = useTranslations("pages");
  const ts = useTranslations("common.status");
  const tc = useTranslations("common");
  const queryClient = useQueryClient();
  const { state: reviews, setState: setReviews } = useContextSection<Review[]>("customer-reviews", []);

  const mutation = useMutation({
    mutationFn: () => updateContextSection("customer-reviews", reviews),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["context", "customer-reviews"] });
      toast.success(tc("save"));
    },
  });

  const updateStatus = (id: string, status: Review["status"]) => {
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    toast.success(ts(status));
  };

  const columns: ColumnDef<Review>[] = [
    { accessorKey: "name", header: t("name") },
    { accessorKey: "job", header: t("job") },
    { accessorKey: "date", header: t("date") },
    {
      accessorKey: "text",
      header: t("text"),
      cell: ({ row }) => <span className="line-clamp-1">{row.original.text}</span>,
    },
    {
      accessorKey: "status",
      header: tc("table.status"),
      cell: ({ row }) => <StatusBadge status={row.original.status} label={ts(row.original.status)} />,
    },
    {
      id: "actions",
      header: tc("actions"),
      cell: ({ row }) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={() => updateStatus(row.original.id, "approved")}>
            <Check className="h-4 w-4 text-success" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => updateStatus(row.original.id, "rejected")}>
            <X className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <PageTransition>
      <PageHeader title={tp("titles.customerReviewsSettings")} description={t("description")} />
      <DataTable columns={columns} data={reviews} searchKey="name" searchPlaceholder={t("namePlaceholder")} />
      <div className="mt-4">
        <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
          {t("save")}
        </Button>
      </div>
    </PageTransition>
  );
}
