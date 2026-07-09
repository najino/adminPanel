"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-elements";
import { PageTransition } from "@/components/shared/page-transition";
import { FileDropzone } from "@/components/shared/file-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { uploadFile } from "@/services/data.service";
import { getContactSection, updateContactSection } from "@/services/storefront.service";

const schema = z.object({
  image_url: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function ContactUsPage() {
  const t = useTranslations("context.contactUs");
  const tp = useTranslations("pages");
  const tc = useTranslations("common");
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["contact-section"],
    queryFn: getContactSection,
  });

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { image_url: "" },
  });

  useEffect(() => {
    if (data) {
      form.reset({ image_url: data.image_url ?? "" });
    }
  }, [data, form]);

  const mutation = useMutation({
    mutationFn: updateContactSection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contact-section"] });
      toast.success(t("saved"));
    },
    onError: () => toast.error(t("saveFailed")),
  });

  const handleImageUpload = async (files: File[]) => {
    const file = files[0];
    if (!file) return;
    const { url } = await uploadFile(file);
    form.setValue("image_url", url);
  };

  return (
    <PageTransition>
      <PageHeader title={tp("titles.contactUsSettings")} description={t("description")} />
      <form onSubmit={form.handleSubmit((v) => mutation.mutate(v))}>
        <Card>
          <CardHeader>
            <CardTitle>{t("title")}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            {isLoading ? (
              <p className="text-sm text-muted-foreground">{tc("loading")}</p>
            ) : (
              <>
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-medium">{t("image")}</span>
                  {form.watch("image_url") ? (
                    <img
                      src={form.watch("image_url")}
                      alt=""
                      className="h-48 w-full rounded-lg object-cover"
                    />
                  ) : null}
                  <FileDropzone
                    onDrop={handleImageUpload}
                    accept={{ "image/*": [] }}
                    label={t("uploadImage")}
                  />
                  <p className="text-xs text-muted-foreground">{t("imageHint")}</p>
                </div>

                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending ? tc("loading") : t("save")}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </form>
    </PageTransition>
  );
}
