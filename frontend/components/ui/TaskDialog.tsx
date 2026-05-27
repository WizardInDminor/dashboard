"use client";

import * as React from "react";

import { useProjects } from "@/hooks/useProjects";
import { useCreateTask, useUpdateTask } from "@/hooks/useTasks";
import type { Task } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const STATUS_OPTIONS = [
  { value: "backlog", label: "Backlog" },
  { value: "in_progress", label: "In Progress" },
  { value: "review", label: "Review" },
  { value: "done", label: "Done" },
];

const PRIORITY_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

const NO_PROJECT = "none";

function toDateInput(value: string | null): string {
  if (!value) return "";
  return value.slice(0, 10);
}

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task;
  defaultProjectId?: number | null;
}

export function TaskDialog({
  open,
  onOpenChange,
  task,
  defaultProjectId,
}: TaskDialogProps) {
  const isEdit = Boolean(task);
  const { data: projects } = useProjects();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();

  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [status, setStatus] = React.useState("backlog");
  const [priority, setPriority] = React.useState("medium");
  const [dueDate, setDueDate] = React.useState("");
  const [projectId, setProjectId] = React.useState<string>(NO_PROJECT);

  React.useEffect(() => {
    if (open) {
      setTitle(task?.title ?? "");
      setDescription(task?.description ?? "");
      setStatus(task?.status ?? "backlog");
      setPriority(task?.priority ?? "medium");
      setDueDate(toDateInput(task?.due_date ?? null));
      const initialProject =
        task?.project_id ?? defaultProjectId ?? null;
      setProjectId(initialProject != null ? String(initialProject) : NO_PROJECT);
    }
  }, [open, task, defaultProjectId]);

  const pending = createTask.isPending || updateTask.isPending;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    const payload = {
      title: title.trim(),
      description: description.trim() || null,
      status,
      priority,
      due_date: dueDate ? new Date(dueDate).toISOString() : null,
      project_id: projectId === NO_PROJECT ? null : Number(projectId),
    };
    if (isEdit && task) {
      await updateTask.mutateAsync({ id: task.id, payload });
    } else {
      await createTask.mutateAsync(payload);
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEdit ? "Edit Task" : "New Task"}</DialogTitle>
            <DialogDescription>
              {isEdit
                ? "Update the task details."
                : "Add a new task and assign it to a project."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="task-title">
                Title
              </label>
              <Input
                id="task-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Task title"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="task-desc">
                Description
              </label>
              <Textarea
                id="task-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Details (optional)"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Priority</label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITY_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="task-due">
                  Due date
                </label>
                <Input
                  id="task-due"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Project</label>
                <Select value={projectId} onValueChange={setProjectId}>
                  <SelectTrigger>
                    <SelectValue placeholder="No project" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_PROJECT}>No project</SelectItem>
                    {projects?.map((p) => (
                      <SelectItem key={p.id} value={String(p.id)}>
                        {p.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending || !title.trim()}>
              {pending ? "Saving..." : isEdit ? "Save" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
