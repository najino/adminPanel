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
import { signUp } from "@/services/auth.service";
import { useAuth } from "@/providers/auth-provider";

const signUpSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
});

type SignUpForm = z.infer<typeof signUpSchema>;

export default function SignUpPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const { setUser } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpForm>({
    resolver: zodResolver(signUpSchema),
  });

  const mutation = useMutation({
    mutationFn: signUp,
    onSuccess: (data) => {
      setUser(data.user);
      toast.success(t("signUp.title"));
      router.push("/");
    },
    onError: () => {
      toast.error("Sign up failed");
    },
  });

  return (
    <AuthLayout title={t("signUp.title")} subtitle={t("signUp.subtitle")}>
      <PageTransition>
        <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Button type="button" variant="outline" className="w-full">
              {t("signUp.withGoogle")}
            </Button>
            <Button type="button" variant="outline" className="w-full">
              {t("signUp.withX")}
            </Button>
          </div>

          <div className="relative text-center">
            <span className="bg-card px-2 text-sm text-muted-foreground">{t("or")}</span>
            <div className="absolute inset-x-0 top-1/2 -z-10 border-t border-border" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="firstName">{t("firstName")}</Label>
              <Input
                id="firstName"
                placeholder={t("placeholder.firstName")}
                {...register("firstName")}
              />
              {errors.firstName && (
                <p className="text-sm text-destructive">{errors.firstName.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">{t("lastName")}</Label>
              <Input
                id="lastName"
                placeholder={t("placeholder.lastName")}
                {...register("lastName")}
              />
              {errors.lastName && (
                <p className="text-sm text-destructive">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
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

          <div className="space-y-2">
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

          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending ? "..." : t("signUp.submit")}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            {t("hasAccount")}{" "}
            <Link href="/signin" className="font-medium text-primary hover:underline">
              {t("signUp.signInLink")}
            </Link>
          </p>
        </form>
      </PageTransition>
    </AuthLayout>
  );
}
