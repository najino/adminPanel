import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Commerce Platform",
  description: "E-commerce admin dashboard",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
