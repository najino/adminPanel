"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/shared/page-elements";
import { PageTransition } from "@/components/shared/page-transition";
import { ProjectForm } from "@/components/projects/project-form";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getAdminProject } from "@/services/project.service";

export default function EditProjectPage() {
  const params = useParams<{ id: string }>();
  const projectId = params.id;
  const t = useTranslations("projects");
  const tp = useTranslations("pages");

  const { data: project, isLoading, isError } = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => getAdminProject(projectId),
    enabled: !!projectId,
  });

  if (isLoading) {
    return (
      <PageTransition>
        <PageHeader title={tp("titles.editProject")} />
        <div className="flex flex-col gap-4">
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-36 w-full rounded-xl" />
        </div>
      </PageTransition>
    );
  }

  if (isError || !project) {
    return (
      <PageTransition>
        <PageHeader title={tp("titles.editProject")} />
        <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed p-10 text-center">
          <p className="text-sm text-muted-foreground">{t("notFound")}</p>
          <Button asChild variant="outline">
            <Link href="/projects">{t("form.actions.cancel")}</Link>
          </Button>
        </div>
      </PageTransition>
    );
  }

  return (
    <ProjectForm
      mode="edit"
      projectId={projectId}
      initial={project}
      pageTitle={tp("titles.editProject")}
    />
  );
}
