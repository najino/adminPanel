"use client";

import { useTranslations } from "next-intl";
import { ProjectForm } from "@/components/projects/project-form";

export default function CreateProjectPage() {
  const tp = useTranslations("pages");
  return <ProjectForm mode="create" pageTitle={tp("titles.addProject")} />;
}
