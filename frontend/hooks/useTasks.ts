import { useMutation, useQueryClient } from "@tanstack/react-query";

import api from "@/lib/api";
import { projectKeys } from "@/hooks/useProjects";
import type { Task } from "@/types";

// Phase 2: only the status mutation used by the kanban board lives here.
// The full task hooks (list/create/update/delete) are added in Phase 3.

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
    onSuccess: (task) => {
      if (task.project_id != null) {
        qc.invalidateQueries({ queryKey: projectKeys.detail(task.project_id) });
      }
      qc.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}
