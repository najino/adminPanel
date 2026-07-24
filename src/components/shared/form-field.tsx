import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

export function FormField({
  label,
  htmlFor,
  error,
  helper,
  required,
  className,
  children,
}: {
  label: string;
  htmlFor?: string;
  error?: string;
  helper?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn("flex flex-col gap-2", className)}
      data-invalid={error ? "true" : undefined}
    >
      <Label
        htmlFor={htmlFor}
        className={cn("text-foreground/90", error && "text-destructive")}
      >
        {label}
        {required && (
          <span className="text-destructive" aria-hidden>
            {" "}
            *
          </span>
        )}
      </Label>
      {children}
      {error ? (
        <p id={htmlFor ? `${htmlFor}-error` : undefined} className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : helper ? (
        <p className="text-xs text-muted-foreground">{helper}</p>
      ) : null}
    </div>
  );
}
