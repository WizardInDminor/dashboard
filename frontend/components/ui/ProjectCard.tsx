"use client";

import * as React from "react";
import Link from "next/link";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";

import type { Project } from "@/types";
import { useDeleteProject } from "@/hooks/useProjects";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const STATUS_LABELS: Record<string, string> = {
  active: "Active",
  on_hold: "On Hold",
  completed: "Completed",
  archived: "Archived",
};

const STATUS_VARIANT: Record<
  string,
  "default" | "secondary" | "outline" | "destructive"
> = {
  active: "default",
  on_hold: "secondary",
  completed: "outline",
  archived: "outline",
};

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
}

export function ProjectCard({ project, onEdit }: ProjectCardProps) {
  const deleteProject = useDeleteProject();

  function handleDelete() {
    if (
      window.confirm(
        `Delete "${project.title}"? This also removes its tasks and notes.`
      )
    ) {
      deleteProject.mutate(project.id);
    }
  }

  return (
    <Card className="relative overflow-hidden transition-shadow hover:shadow-md">
      <div
        className="absolute left-0 top-0 h-full w-1.5"
        style={{ backgroundColor: project.color }}
      />
      <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2 pl-6">
        <Link href={`/projects/${project.id}`} className="min-w-0 flex-1">
          <h3 className="truncate text-lg font-semibold leading-tight hover:underline">
            {project.title}
          </h3>
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              aria-label="Project actions"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(project)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={handleDelete}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="pl-6">
        {project.description ? (
          <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
            {project.description}
          </p>
        ) : (
          <p className="mb-3 text-sm italic text-muted-foreground">
            No description
          </p>
        )}
        <div className="flex items-center justify-between">
          <Badge variant={STATUS_VARIANT[project.status] ?? "secondary"}>
            {STATUS_LABELS[project.status] ?? project.status}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {project.task_count} {project.task_count === 1 ? "task" : "tasks"}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
