"use client";

import * as React from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import { cn } from "@/lib/utils";
import { useUpdateTaskStatus } from "@/hooks/useTasks";
import type { Task } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

const COLUMNS: { id: string; label: string }[] = [
  { id: "backlog", label: "Backlog" },
  { id: "in_progress", label: "In Progress" },
  { id: "review", label: "Review" },
  { id: "done", label: "Done" },
];

const PRIORITY_VARIANT: Record<
  string,
  "default" | "secondary" | "outline" | "destructive"
> = {
  low: "outline",
  medium: "secondary",
  high: "default",
  urgent: "destructive",
};

function TaskCard({ task }: { task: Task }) {
  return (
    <Card className="cursor-grab space-y-2 p-3 active:cursor-grabbing">
      <p className="text-sm font-medium leading-tight">{task.title}</p>
      <div className="flex items-center justify-between">
        <Badge variant={PRIORITY_VARIANT[task.priority] ?? "secondary"}>
          {task.priority}
        </Badge>
        {task.due_date && (
          <span className="text-xs text-muted-foreground">
            {new Date(task.due_date).toLocaleDateString()}
          </span>
        )}
      </div>
    </Card>
  );
}

function DraggableTask({ task }: { task: Task }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: task.id,
  });
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(isDragging && "opacity-40")}
    >
      <TaskCard task={task} />
    </div>
  );
}

function Column({
  id,
  label,
  tasks,
}: {
  id: string;
  label: string;
  tasks: Task[];
}) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex min-h-[12rem] flex-col gap-2 rounded-lg border bg-muted/40 p-3 transition-colors",
        isOver && "bg-muted ring-2 ring-ring"
      )}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">{label}</h3>
        <span className="text-xs text-muted-foreground">{tasks.length}</span>
      </div>
      <div className="flex flex-col gap-2">
        {tasks.map((task) => (
          <DraggableTask key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
}

export function KanbanBoard({ tasks }: { tasks: Task[] }) {
  const updateStatus = useUpdateTaskStatus();
  const [items, setItems] = React.useState<Task[]>(tasks);
  const [activeId, setActiveId] = React.useState<number | null>(null);

  React.useEffect(() => {
    setItems(tasks);
  }, [tasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const byColumn = React.useMemo(() => {
    const map: Record<string, Task[]> = {};
    for (const col of COLUMNS) map[col.id] = [];
    for (const task of items) {
      const key = map[task.status] ? task.status : "backlog";
      map[key].push(task);
    }
    return map;
  }, [items]);

  const activeTask = items.find((t) => t.id === activeId) ?? null;

  function handleDragStart(event: DragStartEvent) {
    setActiveId(Number(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;
    const taskId = Number(active.id);
    const newStatus = String(over.id);
    const task = items.find((t) => t.id === taskId);
    if (!task || task.status === newStatus) return;

    setItems((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );
    updateStatus.mutate({ id: taskId, status: newStatus });
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {COLUMNS.map((col) => (
          <Column
            key={col.id}
            id={col.id}
            label={col.label}
            tasks={byColumn[col.id]}
          />
        ))}
      </div>
      <DragOverlay>{activeTask && <TaskCard task={activeTask} />}</DragOverlay>
    </DndContext>
  );
}
