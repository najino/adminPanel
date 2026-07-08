import { cn } from "@/lib/utils";

export function LoadingSpinner({
  className,
  size = "md",
  label,
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
  label?: string;
}) {
  const sizeClass = {
    sm: "size-4 border-2",
    md: "size-8 border-[3px]",
    lg: "size-12 border-4",
  }[size];

  return (
    <div
      className={cn("flex flex-col items-center justify-center gap-3", className)}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div
        className={cn(
          "animate-spin rounded-full border-primary border-t-transparent motion-reduce:animate-none",
          sizeClass,
        )}
      />
      {label && <p className="text-sm text-muted-foreground">{label}</p>}
    </div>
  );
}
