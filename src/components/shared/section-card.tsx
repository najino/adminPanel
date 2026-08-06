"use client";

import { useId } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function SectionCard({
  title,
  description,
  href,
  linkLabel,
  action,
  children,
  className,
  contentClassName,
}: {
  title: string;
  description?: string;
  href?: string;
  linkLabel?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}) {
  const titleId = useId();

  const linkAction =
    href && linkLabel ? (
      <Link
        href={href}
        className="inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80"
      >
        {linkLabel}
        <ArrowUpRight className="size-3.5" aria-hidden />
      </Link>
    ) : null;

  return (
    <section aria-labelledby={titleId} className={cn(className)}>
      <Card className="h-full overflow-hidden">
        <CardHeader className="flex flex-row items-start justify-between gap-4 border-b border-border/60 pb-4 dark:border-white/5">
          <div className="flex min-w-0 flex-col gap-1">
            <h2 id={titleId} className="text-base leading-none font-semibold">
              {title}
            </h2>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          {action ?? linkAction}
        </CardHeader>
        <CardContent className={cn("pt-4", contentClassName)}>{children}</CardContent>
      </Card>
    </section>
  );
}
