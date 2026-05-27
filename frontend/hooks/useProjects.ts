import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import api from "@/lib/api";
import type {
  Project,
  ProjectCreate,
  ProjectDetail,
  ProjectUpdate,
} from "@/types";

export const projectKeys = {
  all: ["projects"] as const,
  list: (status?: string) => ["projects", { status: status ?? null }] as const,
  detail: (id: number) => ["project", id] as const,
};

export function useProjects(status?: string) {
  return useQuery({
    queryKey: projectKeys.list(status),
    queryFn: async () => {
      const { data } = await api.get<Project[]>("/api/projects", {
        params: status ? { status } : undefined,
      });
      return data;
    },
  });
}

export function useProject(id: number) {
  return useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: async () => {
      const { data } = await api.get<ProjectDetail>(`/api/projects/${id}`);
      return data;
    },
    enabled: Number.isFinite(id),
  });
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: ProjectCreate) => {
      const { data } = await api.post<{ data: Project; message: string }>(
        "/api/projects",
        payload
      );
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: projectKeys.all });
    },
  });
}

export function useUpdateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: number;
      payload: ProjectUpdate;
    }) => {
      const { data } = await api.put<{ data: Project; message: string }>(
        `/api/projects/${id}`,
        payload
      );
      return data.data;
    },
    onSuccess: (project) => {
      qc.invalidateQueries({ queryKey: projectKeys.all });
      qc.invalidateQueries({ queryKey: projectKeys.detail(project.id) });
    },
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/api/projects/${id}`);
      return id;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: projectKeys.all });
    },
  });
}
