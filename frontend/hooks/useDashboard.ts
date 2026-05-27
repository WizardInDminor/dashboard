import { useQuery } from "@tanstack/react-query";

import api from "@/lib/api";
import type { DashboardSummary } from "@/types";

export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard", "summary"],
    queryFn: async () => {
      const { data } = await api.get<DashboardSummary>(
        "/api/dashboard/summary"
      );
      return data;
    },
  });
}
