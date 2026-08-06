import type { Metadata } from "next";
import { ADMIN_ROBOTS } from "@/lib/seo/metadata";

export const metadata: Metadata = {
  robots: ADMIN_ROBOTS,
};

export default function AuthGroupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
