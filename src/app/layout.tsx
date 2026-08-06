import type { Metadata } from "next";
import { ADMIN_ROBOTS } from "@/lib/seo/metadata";

export const metadata: Metadata = {
  title: {
    default: "پنل ادمین فروشگاهی",
    template: "%s | پنل ادمین فروشگاهی",
  },
  description: "داشبورد مدیریت فروشگاه آنلاین",
  robots: ADMIN_ROBOTS,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
