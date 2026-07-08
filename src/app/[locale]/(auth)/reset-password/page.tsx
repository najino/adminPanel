"use client";

import Link from "next/link";
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
import { resetPassword } from "@/services/auth.service";

const resetSchema = z.object({
  email: z.string().email(),
});

type ResetForm = z.infer<typeof resetSchema>;

export default function ResetPasswordPage() {
  const t = useTranslations("auth");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetForm>({
    resolver: zodResolver(resetSchema),
  });

  const mutation = useMutation({
    mutationFn: (data: ResetForm) => resetPassword(data.email),
    onSuccess: () => {
      toast.success("Reset link sent to your email");
    },
    onError: () => {
      toast.error("Failed to send reset link");
    },
  });

  return (
    <AuthLayout title={t("resetPassword.title")} subtitle={t("resetPassword.subtitle")}>
      <PageTransition>
        <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">{t("email")}</Label>
            <Input
              id="email"
              type="email"
              placeholder={t("placeholder.emailFull")}
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending ? "..." : t("resetPassword.submit")}
          </Button>

          <p className="text-center text-sm">
            <Link href="/signin" className="text-primary hover:underline">
              {t("resetPassword.backToSignIn")}
            </Link>
          </p>
        </form>
      </PageTransition>
    </AuthLayout>
  );
}
