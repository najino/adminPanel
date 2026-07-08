"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";
import { PageTransition } from "@/components/shared/page-transition";
import { PageHeader, StatusBadge } from "@/components/shared/page-elements";
import { DataTable } from "@/components/tables/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getCustomers } from "@/services/data.service";
import { formatDate } from "@/lib/utils";
import type { Customer } from "@/types";

export default function UsersPage() {
  const t = useTranslations("users");
  const tCommon = useTranslations("common");

  const [search, setSearch] = useState("");

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ["customers"],
    queryFn: getCustomers,
  });

  const filtered = search
    ? customers.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.email.toLowerCase().includes(search.toLowerCase()),
      )
    : customers;

  const columns: ColumnDef<Customer>[] = [
    {
      accessorKey: "name",
      header: t("table.columns.user"),
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.name}</p>
          <StatusBadge status={row.original.status} />
        </div>
      ),
    },
    {
      accessorKey: "email",
      header: t("table.columns.email"),
    },
    {
      accessorKey: "phone",
      header: t("table.columns.phone"),
    },
    {
      accessorKey: "orders",
      header: t("detail.orderHistory.title"),
      cell: ({ row }) => row.original.orders,
    },
    {
      id: "joinDate",
      header: t("table.columns.joinDate"),
      cell: () => formatDate(new Date().toISOString()),
    },
    {
      id: "actions",
      header: t("table.columns.actions"),
      cell: ({ row }) => (
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/users/${row.original.id}`}>
            <Eye className="h-4 w-4" />
          </Link>
        </Button>
      ),
    },
  ];

  return (
    <PageTransition>
      <PageHeader title={t("pageTitle")} />

      <div className="mb-4">
        <Input
          placeholder={t("filters.searchPlaceholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        isLoading={isLoading}
        emptyTitle={tCommon("noData")}
      />
    </PageTransition>
  );
}
