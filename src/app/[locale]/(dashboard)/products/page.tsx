"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { ColumnDef } from "@tanstack/react-table";
import { Eye, Pencil, Search, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageTransition } from "@/components/shared/page-transition";
import { PageHeader, StatusBadge } from "@/components/shared/page-elements";
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
import { getProducts, getCategories, deleteProduct } from "@/services/data.service";
import { getProductRatingSummaries } from "@/services/product.service";
import { formatCurrency } from "@/lib/utils";
import type { Product } from "@/types";

function ProductRatingCell({
  average,
  count,
}: {
  average?: number;
  count?: number;
}) {
  if (!count || !average) {
    return <span className="text-xs text-muted-foreground">—</span>;
  }
  const filled = Math.round(average);
  return (
    <div className="flex flex-col gap-0.5" title={`${average}/5 · ${count}`}>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            className={
              i < filled
                ? "size-3.5 fill-amber-400 text-amber-400"
                : "size-3.5 text-muted-foreground/35"
            }
          />
        ))}
      </div>
      <span className="text-[11px] tabular-nums text-muted-foreground">
        {average} ({count})
      </span>
    </div>
  );
}

export default function ProductsPage() {
  const t = useTranslations("products");
  const tCommon = useTranslations("common");
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products", search, category, status],
    queryFn: () =>
      getProducts({
        search: search || undefined,
        category: category !== "all" ? category : undefined,
        status: status !== "all" ? status : undefined,
      }),
  });

  const { data: ratingSummaries = {} } = useQuery({
    queryKey: ["product-rating-summaries"],
    queryFn: getProductRatingSummaries,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success(tCommon("delete"));
      setDeleteId(null);
    },
    onError: () => toast.error("Failed to delete product"),
  });

  const columns: ColumnDef<Product>[] = [
    {
      accessorKey: "name",
      header: t("table.columns.product"),
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          {row.original.images[0] && (
            <img
              src={row.original.images[0]}
              alt={row.original.name}
              className="size-10 rounded-lg object-cover ring-1 ring-border"
            />
          )}
          <div className="min-w-0">
            <p className="truncate font-medium">{row.original.name}</p>
            <p className="text-xs text-muted-foreground">{row.original.sku}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "category",
      header: t("table.columns.category"),
    },
    {
      accessorKey: "price",
      header: t("table.columns.price"),
      cell: ({ row }) => (
        <span className="tabular-nums font-medium">{formatCurrency(row.original.price)}</span>
      ),
    },
    {
      id: "rating",
      header: t("table.columns.rating"),
      cell: ({ row }) => {
        const summary = ratingSummaries[row.original.id];
        return (
          <ProductRatingCell average={summary?.average} count={summary?.count} />
        );
      },
    },
    {
      accessorKey: "status",
      header: t("table.columns.status"),
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "stock",
      header: t("table.columns.stock"),
      cell: ({ row }) => <span className="tabular-nums">{row.original.stock}</span>,
    },
    {
      id: "actions",
      header: t("table.columns.actions"),
      cell: ({ row }) => (
        <TableRowActions
          actions={[
            {
              label: tCommon("view"),
              icon: Eye,
              href: `/products/${row.original.id}`,
            },
            {
              label: tCommon("edit"),
              icon: Pencil,
              href: `/products/${row.original.id}/edit`,
            },
            {
              label: tCommon("delete"),
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
        title={t("pageTitle")}
        action={
          <Button asChild>
            <Link href="/products/create">{t("addButton")}</Link>
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
            aria-label={t("filters.searchPlaceholder")}
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="h-10 w-full sm:w-44">
            <SelectValue placeholder={t("filters.allCategories")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("filters.allCategories")}</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.name}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="h-10 w-full sm:w-44">
            <SelectValue placeholder={t("filters.allStatus")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("filters.allStatus")}</SelectItem>
            <SelectItem value="active">{tCommon("status.active")}</SelectItem>
            <SelectItem value="lowStock">{tCommon("status.lowStock")}</SelectItem>
            <SelectItem value="outOfStock">{tCommon("status.outOfStock")}</SelectItem>
          </SelectContent>
        </Select>
      </FilterBar>

      <DataTable
        columns={columns}
        data={products}
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
