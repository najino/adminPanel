"use client";

import Link from "next/link";
import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export interface RowAction {
  label: string;
  icon: LucideIcon;
  href?: string;
  onClick?: () => void;
  variant?: "default" | "destructive";
}

export function TableRowActions({
  actions,
  className,
}: {
  actions: RowAction[];
  className?: string;
}) {
  return (
    <TooltipProvider delayDuration={300}>
      <div className={cn("flex items-center gap-0.5", className)}>
        {actions.map(({ label, icon: Icon, href, onClick, variant }) => (
          <Tooltip key={label}>
            <TooltipTrigger asChild>
              {href ? (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className={cn(
                    "size-8 text-muted-foreground hover:text-foreground",
                    variant === "destructive" && "hover:text-destructive",
                  )}
                  asChild
                >
                  <Link href={href} aria-label={label}>
                    <Icon className="size-4" />
                  </Link>
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className={cn(
                    "size-8 text-muted-foreground hover:text-foreground",
                    variant === "destructive" && "hover:text-destructive",
                  )}
                  onClick={onClick}
                  aria-label={label}
                >
                  <Icon className="size-4" />
                </Button>
              )}
            </TooltipTrigger>
            <TooltipContent side="top">{label}</TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}
