"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import { PageHeader, StatusBadge } from "@/components/shared/page-elements";
import { PageTransition } from "@/components/shared/page-transition";
import { DataTable } from "@/components/tables/data-table";
import { Button } from "@/components/ui/button";
import { getPosts } from "@/services/data.service";
import { formatDate } from "@/lib/utils";
import type { BlogPost } from "@/types";

export default function WeblogPage() {
  const t = useTranslations("posts");
  const tp = useTranslations("pages");
  const ts = useTranslations("common.status");

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["posts"],
    queryFn: getPosts,
  });

  const columns: ColumnDef<BlogPost>[] = [
    { accessorKey: "title", header: "Title" },
    { accessorKey: "author", header: t("table.columns.author") },
    { accessorKey: "category", header: t("table.columns.category") },
    {
      accessorKey: "status",
      header: t("table.columns.status"),
      cell: ({ row }) => <StatusBadge status={row.original.status} label={ts(row.original.status.toLowerCase())} />,
    },
    {
      accessorKey: "publishedDate",
      header: t("commentsTable.columns.date"),
      cell: ({ row }) => (
        <span className="tabular-nums text-muted-foreground">
          {formatDate(row.original.publishedDate)}
        </span>
      ),
    },
  ];

  return (
    <PageTransition>
      <PageHeader
        title={tp("titles.allPosts")}
        action={
          <Button asChild>
            <Link href="/weblog/create">
              <Plus className="me-2 h-4 w-4" />
              {t("allPosts.addButton")}
            </Link>
          </Button>
        }
      />
      <DataTable
        columns={columns}
        data={posts}
        searchKey="title"
        searchPlaceholder={t("filters.searchPlaceholder")}
        isLoading={isLoading}
      />
    </PageTransition>
  );
}
