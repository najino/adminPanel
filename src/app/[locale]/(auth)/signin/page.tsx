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

  const onSubmit = (data: SignInForm) => {
    mutation.mutate(data);
  };

  return (
    <AuthLayout title={t("signIn.title")} subtitle={t("signIn.subtitle")}>
      <PageTransition>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <Button type="button" variant="outline" className="w-full">
              {t("signIn.withGoogle")}
            </Button>
            <Button type="button" variant="outline" className="w-full">
              {t("signIn.withX")}
            </Button>
          </div>

          <div className="relative text-center">
            <span className="bg-card px-2 text-sm text-muted-foreground">{t("or")}</span>
            <div className="absolute inset-x-0 top-1/2 -z-10 border-t border-border" />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="email">{t("email")}</Label>
            <Input
              id="email"
              type="email"
              placeholder={t("placeholder.email")}
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="password">{t("password")}</Label>
            <Input
              id="password"
              type="password"
              placeholder={t("placeholder.password")}
              {...register("password")}
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>

          <div className="flex items-center justify-between">
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
            <Link href="/reset-password" className="text-sm text-primary hover:underline">
              {t("forgotPassword")}
            </Link>
          </div>

          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending ? "..." : t("signIn.submit")}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            {t("noAccount")}{" "}
            <Link href="/signup" className="font-medium text-primary hover:underline">
              {t("signIn.signUpLink")}
            </Link>
          </p>

          <p className="text-center text-xs text-muted-foreground">
            {t("termsPrefix")}{" "}
            <Link href="#" className="text-primary hover:underline">
              {t("termsAndConditions")}
            </Link>{" "}
            <Link href="#" className="text-primary hover:underline">
              {t("privacyPolicy")}
            </Link>
          </p>
        </form>
      </PageTransition>
    </AuthLayout>
  );
}
