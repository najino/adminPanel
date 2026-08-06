import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "پنل ادمین فروشگاهی",
  description: "داشبورد مدیریت فروشگاه آنلاین",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
