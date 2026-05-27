"use client";

import Link from "next/link";
import { ChevronRight, FolderKanban } from "lucide-react";

import { useDashboard } from "@/hooks/useDashboard";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function ProgressBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
      <div
        className="h-full rounded-full transition-all"
        style={{ width: `${value}%`, backgroundColor: color }}
      />
    </div>
  );
}

export function ProjectsWidget() {
  const { data, isLoading, isError } = useDashboard();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <FolderKanban className="h-4 w-4" />
          Active Projects
        </CardTitle>
        <Link
          href="/projects"
          className="flex items-center text-xs text-muted-foreground hover:underline"
        >
          View all
          <ChevronRight className="h-3 w-3" />
        </Link>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading && (
          <div className="space-y-3">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        )}
        {isError && (
          <p className="text-sm text-destructive">Failed to load.</p>
        )}
        {data && data.in_progress_projects.length === 0 && (
          <p className="text-sm text-muted-foreground">No active projects.</p>
        )}
        {data?.in_progress_projects.map((project) => {
          const pct =
            project.total_tasks === 0
              ? 0
              : Math.round((project.done_tasks / project.total_tasks) * 100);
          return (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="block space-y-1.5"
            >
              <div className="flex items-center justify-between text-sm">
                <span className="truncate font-medium hover:underline">
                  {project.title}
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {project.done_tasks}/{project.total_tasks}
                </span>
              </div>
              <ProgressBar value={pct} color={project.color} />
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
