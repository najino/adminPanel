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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getContextSection, updateContextSection } from "@/services/data.service";

const schema = z.object({
  heading: z.string(),
  body: z.string(),
  showNameField: z.boolean(),
  showEmailField: z.boolean(),
  showPhoneField: z.boolean(),
  showSubjectField: z.boolean(),
  showMessageField: z.boolean(),
});

type FormData = z.infer<typeof schema>;

export default function ContactUsPage() {
  const t = useTranslations("context.contactUs");
  const tp = useTranslations("pages");
  const tc = useTranslations("common");
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ["context", "contact-us"],
    queryFn: () => getContextSection("contact-us"),
  });

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      heading: "",
      body: "",
      showNameField: true,
      showEmailField: true,
      showPhoneField: false,
      showSubjectField: true,
      showMessageField: true,
    },
  });

  useEffect(() => {
    const sectionData = (data?.data ?? {}) as Partial<FormData>;
    if (Object.keys(sectionData).length > 0) {
      form.reset({ ...form.getValues(), ...sectionData });
    }
  }, [data, form]);

  const mutation = useMutation({
    mutationFn: (payload: FormData) => updateContextSection("contact-us", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["context", "contact-us"] });
      toast.success(tc("save"));
    },
  });

  const fieldToggles: { key: keyof FormData; label: string }[] = [
    { key: "showNameField", label: "Name" },
    { key: "showEmailField", label: "Email" },
    { key: "showPhoneField", label: "Phone" },
    { key: "showSubjectField", label: "Subject" },
    { key: "showMessageField", label: "Message" },
  ];

  return (
    <PageTransition>
      <PageHeader title={tp("titles.contactUsSettings")} description={t("description")} />
      <form onSubmit={form.handleSubmit((v) => mutation.mutate(v))}>
        <Card>
          <CardHeader>
            <CardTitle>{t("title")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Section Heading</Label>
              <Input {...form.register("heading")} placeholder={t("title")} />
            </div>
            <div className="space-y-2">
              <Label>Body</Label>
              <Textarea {...form.register("body")} placeholder={t("description")} rows={4} />
            </div>

            <div className="space-y-3">
              <p className="font-medium">Form Field Configuration</p>
              {fieldToggles.map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <span>{label}</span>
                  <Switch
                    checked={form.watch(key) as boolean}
                    onCheckedChange={(v) => form.setValue(key, v)}
                  />
                </div>
              ))}
            </div>

            <Button type="submit" disabled={mutation.isPending}>
              {t("save")}
            </Button>
          </CardContent>
        </Card>
      </form>
    </PageTransition>
  );
}
