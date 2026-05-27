import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import api from "@/lib/api";
import { projectKeys } from "@/hooks/useProjects";
import type { Task, TaskCreate, TaskUpdate } from "@/types";

export interface TaskFilters {
  project_id?: number;
  status?: string;
  priority?: string;
}

export const taskKeys = {
  all: ["tasks"] as const,
  list: (filters?: TaskFilters) => ["tasks", filters ?? {}] as const,
};

function invalidateTaskCaches(qc: ReturnType<typeof useQueryClient>, task?: Task) {
  qc.invalidateQueries({ queryKey: taskKeys.all });
  qc.invalidateQueries({ queryKey: projectKeys.all });
  if (task?.project_id != null) {
    qc.invalidateQueries({ queryKey: projectKeys.detail(task.project_id) });
  }
}

export function useTasks(filters?: TaskFilters) {
  return useQuery({
    queryKey: taskKeys.list(filters),
    queryFn: async () => {
      const { data } = await api.get<Task[]>("/api/tasks", {
        params: filters,
      });
      return data;
    },
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: TaskCreate) => {
      const { data } = await api.post<{ data: Task; message: string }>(
        "/api/tasks",
        payload
      );
      return data.data;
    },
    onSuccess: (task) => {
      invalidateTaskCaches(qc, task);
      toast.success("Task created");
    },
    onError: () => toast.error("Failed to create task"),
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: number;
      payload: TaskUpdate;
    }) => {
      const { data } = await api.put<{ data: Task; message: string }>(
        `/api/tasks/${id}`,
        payload
      );
      return data.data;
    },
    onSuccess: (task) => {
      invalidateTaskCaches(qc, task);
      toast.success("Task updated");
    },
    onError: () => toast.error("Failed to update task"),
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/api/tasks/${id}`);
      return id;
    },
    onSuccess: () => {
      invalidateTaskCaches(qc);
      toast.success("Task deleted");
    },
    onError: () => toast.error("Failed to delete task"),
  });
}

export function useReorderTasks(filters?: TaskFilters) {
  const qc = useQueryClient();
  const key = taskKeys.list(filters);
  return useMutation({
    mutationFn: async (orderedTasks: Task[]) => {
      await api.patch("/api/tasks/reorder", {
        task_ids: orderedTasks.map((t) => t.id),
      });
    },
    // Optimistically write the new order so the list doesn't flicker.
    onMutate: async (orderedTasks: Task[]) => {
      await qc.cancelQueries({ queryKey: key });
      const previous = qc.getQueryData<Task[]>(key);
      qc.setQueryData<Task[]>(key, orderedTasks);
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) qc.setQueryData(key, context.previous);
      toast.error("Failed to reorder tasks");
    },
    // Reordering changes global sort_order, so other cached filter views
    // are now stale; refetch them all (the active view already matches).
    onSettled: () => qc.invalidateQueries({ queryKey: taskKeys.all }),
  });
}

export function useUpdateTaskStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const { data } = await api.patch<{ data: Task; message: string }>(
        `/api/tasks/${id}/status`,
        { status }
      );
      return data.data;
    },
    onSuccess: (task) => invalidateTaskCaches(qc, task),
    onError: () => toast.error("Failed to update task status"),
  });
}
