"use client";

import * as React from "react";
import { Plus } from "lucide-react";

import { useProjects } from "@/hooks/useProjects";
import { useTasks, type TaskFilters } from "@/hooks/useTasks";
import type { Task } from "@/types";
import { Button } from "@/components/ui/button";
import { TaskRow } from "@/components/ui/TaskRow";
import { TaskDialog } from "@/components/ui/TaskDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ALL = "all";

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

type GroupBy = "project" | "due_date";

function startOfToday(): Date {
  return new Date(new Date().toDateString());
}

function dueDateBucket(task: Task): string {
  if (!task.due_date) return "No due date";
  const due = new Date(task.due_date);
  const today = startOfToday();
  const endOfWeek = new Date(today);
  endOfWeek.setDate(today.getDate() + 7);
  if (due < today) return "Overdue";
  if (due.toDateString() === today.toDateString()) return "Today";
  if (due < endOfWeek) return "This Week";
  return "Later";
}

const DUE_ORDER = ["Overdue", "Today", "This Week", "Later", "No due date"];

export default function TasksPage() {
  const [status, setStatus] = React.useState(ALL);
  const [priority, setPriority] = React.useState(ALL);
  const [projectId, setProjectId] = React.useState(ALL);
  const [groupBy, setGroupBy] = React.useState<GroupBy>("project");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Task | undefined>(undefined);

  const { data: projects } = useProjects();

  const filters: TaskFilters = {};
  if (status !== ALL) filters.status = status;
  if (priority !== ALL) filters.priority = priority;
  if (projectId !== ALL) filters.project_id = Number(projectId);

  const { data: tasks, isLoading, isError } = useTasks(filters);

  const projectsById = React.useMemo(() => {
    const map = new Map<number, { title: string; color: string }>();
    projects?.forEach((p) => map.set(p.id, { title: p.title, color: p.color }));
    return map;
  }, [projects]);

  const groups = React.useMemo(() => {
    const result = new Map<string, Task[]>();
    if (!tasks) return result;
    for (const task of tasks) {
      const key =
        groupBy === "project"
          ? task.project_id != null
            ? projectsById.get(task.project_id)?.title ?? "Unknown project"
            : "No project"
          : dueDateBucket(task);
      if (!result.has(key)) result.set(key, []);
      result.get(key)!.push(task);
    }
    return result;
  }, [tasks, groupBy, projectsById]);

  const orderedKeys = React.useMemo(() => {
    const keys = Array.from(groups.keys());
    if (groupBy === "due_date") {
      return keys.sort(
        (a, b) => DUE_ORDER.indexOf(a) - DUE_ORDER.indexOf(b)
      );
    }
    return keys.sort((a, b) => a.localeCompare(b));
  }, [groups, groupBy]);

  function openCreate() {
    setEditing(undefined);
    setDialogOpen(true);
  }
  function openEdit(task: Task) {
    setEditing(task);
    setDialogOpen(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Tasks</h2>
          <p className="text-sm text-muted-foreground">
            All tasks across your projects.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          New Task
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All statuses</SelectItem>
            {STATUS_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={priority} onValueChange={setPriority}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All priorities</SelectItem>
            {PRIORITY_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={projectId} onValueChange={setProjectId}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Project" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All projects</SelectItem>
            {projects?.map((p) => (
              <SelectItem key={p.id} value={String(p.id)}>
                {p.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="ml-auto flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Group by</span>
          <Select
            value={groupBy}
            onValueChange={(v) => setGroupBy(v as GroupBy)}
          >
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="project">Project</SelectItem>
              <SelectItem value="due_date">Due date</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading && (
        <p className="text-sm text-muted-foreground">Loading tasks...</p>
      )}
      {isError && (
        <p className="text-sm text-destructive">
          Failed to load tasks. Is the backend running?
        </p>
      )}

      {tasks && tasks.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
          <p className="mb-1 font-medium">No tasks found</p>
          <p className="mb-4 text-sm text-muted-foreground">
            Create a task or adjust your filters.
          </p>
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            New Task
          </Button>
        </div>
      )}

      {tasks && tasks.length > 0 && (
        <div className="space-y-6">
          {orderedKeys.map((key) => (
            <div key={key}>
              <h3 className="mb-2 text-sm font-semibold text-muted-foreground">
                {key}{" "}
                <span className="font-normal">({groups.get(key)!.length})</span>
              </h3>
              <div className="divide-y rounded-lg border">
                {groups.get(key)!.map((task) => {
                  const project =
                    task.project_id != null
                      ? projectsById.get(task.project_id)
                      : undefined;
                  return (
                    <TaskRow
                      key={task.id}
                      task={task}
                      projectTitle={project?.title}
                      projectColor={project?.color}
                      onEdit={openEdit}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <TaskDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        task={editing}
      />
    </div>
  );
}
