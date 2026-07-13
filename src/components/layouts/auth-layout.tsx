import Link from "next/link";
import { Store, BarChart3, Shield, Zap } from "lucide-react";

const highlights = [
  { icon: BarChart3, label: "Real-time analytics" },
  { icon: Shield, label: "Secure by default" },
  { icon: Zap, label: "Built for speed" },
];

export function AuthLayout({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-primary p-10 text-primary-foreground lg:flex">
        <div className="auth-grid-bg absolute inset-0 opacity-30" aria-hidden />
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2.5 font-semibold tracking-tight">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary-foreground/15 backdrop-blur-sm">
              <Store className="size-5" aria-hidden />
            </div>
            پنل ادمین فروشگاهی
          </Link>
        </div>

        <div className="relative z-10 flex flex-col gap-6">
          <blockquote className="max-w-md text-2xl leading-snug font-medium tracking-tight">
            Manage your store, orders, and content from one unified command center.
          </blockquote>
          <ul className="flex flex-col gap-3">
            {highlights.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-2.5 text-sm text-primary-foreground/80">
                <Icon className="size-4 shrink-0" aria-hidden />
                {label}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 text-xs text-primary-foreground/60">
          © {new Date().getFullYear()} پنل ادمین فروشگاهی
        </p>
      </div>

      <div className="flex flex-col items-center justify-center px-4 py-12 sm:px-8">
        <div className="mb-8 flex w-full max-w-[400px] flex-col gap-2 lg:hidden">
          <Link href="/" className="flex items-center gap-2 font-semibold text-primary">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Store className="size-4" aria-hidden />
            </div>
            پنل ادمین فروشگاهی
          </Link>
        </div>

        <div className="w-full max-w-[400px]">
          <div className="mb-8 flex flex-col gap-1.5">
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
          </div>
          <div className="rounded-xl border border-border bg-card p-6 shadow-elevated-md">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
