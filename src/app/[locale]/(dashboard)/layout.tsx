import type { Metadata } from "next";
import { ADMIN_ROBOTS } from "@/lib/seo/metadata";
import { AppLayout } from "@/components/layouts/app-layout";

export const metadata: Metadata = {
  robots: ADMIN_ROBOTS,
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <AppLayout>{children}</AppLayout>;
}
