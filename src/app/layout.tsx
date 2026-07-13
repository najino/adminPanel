import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "پنل ادمین فروشگاهی",
  description: "داشبورد مدیریت فروشگاه آنلاین",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
