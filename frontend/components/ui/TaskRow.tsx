"use client";

import * as React from "react";
import { Check, MoreVertical, Pencil, Trash2 } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  useDeleteTask,
  useUpdateTask,
  useUpdateTaskStatus,
} from "@/hooks/useTasks";
import type { Task } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const PRIORITY_VARIANT: Record<
  string,
  "default" | "secondary" | "outline" | "destructive"
> = {
  low: "outline",
  medium: "secondary",
  high: "default",
  urgent: "destructive",
};

function isOverdue(task: Task): boolean {
  if (!task.due_date || task.status === "done") return false;
  return new Date(task.due_date) < new Date(new Date().toDateString());
}

interface TaskRowProps {
  task: Task;
  projectTitle?: string;
  projectColor?: string;
  onEdit: (task: Task) => void;
}

export function TaskRow({
  task,
  projectTitle,
  projectColor,
  onEdit,
}: TaskRowProps) {
  const updateStatus = useUpdateTaskStatus();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const [editing, setEditing] = React.useState(false);
  const [title, setTitle] = React.useState(task.title);

  React.useEffect(() => {
    setTitle(task.title);
  }, [task.title]);

  const done = task.status === "done";

  function toggleDone() {
    updateStatus.mutate({
      id: task.id,
      status: done ? "backlog" : "done",
    });
  }

  function commitTitle() {
    const trimmed = title.trim();
    setEditing(false);
    if (trimmed && trimmed !== task.title) {
      updateTask.mutate({ id: task.id, payload: { title: trimmed } });
    } else {
      setTitle(task.title);
    }
  }

  function handleDelete() {
    if (window.confirm(`Delete "${task.title}"?`)) {
      deleteTask.mutate(task.id);
    }
  }

  return (
    <div className="flex items-center gap-3 px-4 py-2.5">
      <button
        type="button"
        onClick={toggleDone}
        aria-label={done ? "Mark as not done" : "Mark as done"}
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors",
          done
            ? "border-primary bg-primary text-primary-foreground"
            : "border-input hover:border-primary"
        )}
      >
        {done && <Check className="h-3.5 w-3.5" />}
      </button>

      <div className="min-w-0 flex-1">
        {editing ? (
          <Input
            value={title}
            autoFocus
            onChange={(e) => setTitle(e.target.value)}
            onBlur={commitTitle}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitTitle();
              if (e.key === "Escape") {
                setTitle(task.title);
                setEditing(false);
              }
            }}
            className="h-7"
          />
        ) : (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className={cn(
              "truncate text-left text-sm",
              done && "text-muted-foreground line-through"
            )}
          >
            {task.title}
          </button>
        )}
      </div>

      {projectTitle && (
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
          {projectColor && (
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: projectColor }}
            />
          )}
          {projectTitle}
        </span>
      )}

      <Badge
        variant={PRIORITY_VARIANT[task.priority] ?? "secondary"}
        className="shrink-0"
      >
        {task.priority}
      </Badge>

      {task.due_date && (
        <span
          className={cn(
            "w-24 shrink-0 text-right text-xs",
            isOverdue(task)
              ? "font-medium text-destructive"
              : "text-muted-foreground"
          )}
        >
          {new Date(task.due_date).toLocaleDateString()}
        </span>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0"
            aria-label="Task actions"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onEdit(task)}>
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
    </div>
  );
}
