"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { useProject } from "@/hooks/useProjects";
import type { Task } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { KanbanBoard } from "@/components/ui/KanbanBoard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const STATUS_LABELS: Record<string, string> = {
  backlog: "Backlog",
  in_progress: "In Progress",
  review: "Review",
  done: "Done",
};

function TaskList({ tasks }: { tasks: Task[] }) {
  if (tasks.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No tasks yet.
      </p>
    );
  }
  return (
    <div className="divide-y rounded-lg border">
      {tasks.map((task) => (
        <div
          key={task.id}
          className="flex items-center justify-between px-4 py-3"
        >
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{task.title}</p>
            {task.description && (
              <p className="truncate text-xs text-muted-foreground">
                {task.description}
              </p>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Badge variant="outline">{task.priority}</Badge>
            <Badge variant="secondary">
              {STATUS_LABELS[task.status] ?? task.status}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const { data: project, isLoading, isError } = useProject(id);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-10 w-72" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    );
  }
  if (isError || !project) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-destructive">Project not found.</p>
        <Button asChild variant="outline">
          <Link href="/projects">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to projects
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <span
          className="mt-1 h-8 w-1.5 shrink-0 rounded-full"
          style={{ backgroundColor: project.color }}
        />
        <div className="flex-1">
          <Link
            href="/projects"
            className="mb-1 inline-flex items-center text-xs text-muted-foreground hover:underline"
          >
            <ArrowLeft className="mr-1 h-3 w-3" />
            Projects
          </Link>
          <h2 className="text-2xl font-semibold tracking-tight">
            {project.title}
          </h2>
          {project.description && (
            <p className="text-sm text-muted-foreground">
              {project.description}
            </p>
          )}
        </div>
      </div>

      <Tabs defaultValue="kanban">
        <TabsList>
          <TabsTrigger value="kanban">Kanban</TabsTrigger>
          <TabsTrigger value="list">List</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="kanban" className="mt-4">
          <KanbanBoard tasks={project.tasks} />
        </TabsContent>

        <TabsContent value="list" className="mt-4">
          <TaskList tasks={project.tasks} />
        </TabsContent>

        <TabsContent value="notes" className="mt-4">
          {project.notes.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No notes yet.
            </p>
          ) : (
            <div className="space-y-3">
              {project.notes.map((note) => (
                <Card key={note.id} className="p-4">
                  <p className="whitespace-pre-wrap text-sm">{note.content}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {new Date(note.created_at).toLocaleString()}
                  </p>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
