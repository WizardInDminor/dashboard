import { useQuery } from "@tanstack/react-query";

import api from "@/lib/api";
import type { GithubActivityItem, NewsItem } from "@/types";

const THIRTY_MINUTES = 30 * 60 * 1000;

export function useNews() {
  return useQuery({
    queryKey: ["integrations", "news"],
    queryFn: async () => {
      const { data } = await api.get<NewsItem[]>("/api/integrations/news");
      return data;
    },
    staleTime: THIRTY_MINUTES,
    refetchInterval: THIRTY_MINUTES,
  });
}

export function useGithubActivity(username: string) {
  return useQuery({
    queryKey: ["integrations", "github", username],
    queryFn: async () => {
      const { data } = await api.get<GithubActivityItem[]>(
        "/api/integrations/github",
        { params: { username } }
      );
      return data;
    },
    staleTime: THIRTY_MINUTES,
    enabled: Boolean(username),
  });
}
