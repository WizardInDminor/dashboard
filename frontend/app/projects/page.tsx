"use client";

import * as React from "react";
import { Plus } from "lucide-react";

import { useProjects } from "@/hooks/useProjects";
import type { Project } from "@/types";
import { Button } from "@/components/ui/button";
import { ProjectCard } from "@/components/ui/ProjectCard";
import { ProjectDialog } from "@/components/ui/ProjectDialog";

export default function ProjectsPage() {
  const { data: projects, isLoading, isError } = useProjects();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Project | undefined>(undefined);

  function openCreate() {
    setEditing(undefined);
    setDialogOpen(true);
  }

  function openEdit(project: Project) {
    setEditing(project);
    setDialogOpen(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Projects</h2>
          <p className="text-sm text-muted-foreground">
            Organize your work into projects.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>

      {isLoading && (
        <p className="text-sm text-muted-foreground">Loading projects...</p>
      )}
      {isError && (
        <p className="text-sm text-destructive">
          Failed to load projects. Is the backend running?
        </p>
      )}

      {projects && projects.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
          <p className="mb-1 font-medium">No projects yet</p>
          <p className="mb-4 text-sm text-muted-foreground">
            Create your first project to get started.
          </p>
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </div>
      )}

      {projects && projects.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={openEdit}
            />
          ))}
        </div>
      )}

      <ProjectDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        project={editing}
      />
    </div>
  );
}
