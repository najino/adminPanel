"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { AuthLayout } from "@/components/layouts/auth-layout";
import { PageTransition } from "@/components/shared/page-transition";
import { FormField } from "@/components/shared/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { signIn } from "@/services/auth.service";
import { useAuth } from "@/providers/auth-provider";

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  rememberMe: z.boolean().optional(),
});

type SignInForm = z.infer<typeof signInSchema>;

export default function SignInPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const { setUser } = useAuth();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SignInForm>({
    resolver: zodResolver(signInSchema),
    defaultValues: { rememberMe: false },
  });

  const rememberMe = watch("rememberMe");

  const mutation = useMutation({
    mutationFn: signIn,
    onSuccess: (data) => {
      setUser(data.user);
      toast.success(t("signIn.title"));
      router.push("/");
    },
    onError: () => {
      toast.error("Invalid credentials");
    },
  });

  return (
    <AuthLayout title={t("signIn.title")} subtitle={t("signIn.subtitle")}>
      <PageTransition>
        <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-3">
            <Button type="button" variant="outline" className="h-10 w-full">
              {t("signIn.withGoogle")}
            </Button>
            <Button type="button" variant="outline" className="h-10 w-full">
              {t("signIn.withX")}
            </Button>
          </div>

          <div className="relative flex items-center justify-center py-1">
            <div className="absolute inset-x-0 border-t border-border" aria-hidden />
            <span className="relative bg-card px-3 text-xs text-muted-foreground">{t("or")}</span>
          </div>

          <FormField label={t("email")} htmlFor="email" error={errors.email?.message} required>
            <Input
              id="email"
              type="email"
              placeholder={t("placeholder.email")}
              className="h-10"
              {...register("email")}
            />
          </FormField>

          <FormField
            label={t("password")}
            htmlFor="password"
            error={errors.password?.message}
            required
          >
            <Input
              id="password"
              type="password"
              placeholder={t("placeholder.password")}
              className="h-10"
              {...register("password")}
            />
          </FormField>

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Checkbox
                id="rememberMe"
                checked={rememberMe}
                onCheckedChange={(checked) => setValue("rememberMe", !!checked)}
              />
              <Label htmlFor="rememberMe" className="text-sm font-normal">
                {t("rememberMe")}
              </Label>
            </div>
            <Link
              href="/reset-password"
              className="text-sm font-medium text-primary hover:underline"
            >
              {t("forgotPassword")}
            </Link>
          </div>

          <Button type="submit" className="h-10 w-full" disabled={mutation.isPending}>
            {mutation.isPending ? "..." : t("signIn.submit")}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            {t("noAccount")}{" "}
            <Link href="/signup" className="font-medium text-primary hover:underline">
              {t("signIn.signUpLink")}
            </Link>
          </p>
        </form>
      </PageTransition>
    </AuthLayout>
  );
}
