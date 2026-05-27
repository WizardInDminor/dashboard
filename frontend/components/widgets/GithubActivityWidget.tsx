"use client";

import { GitBranch } from "lucide-react";

import { GITHUB_USERNAME } from "@/lib/config";
import { useGithubActivity } from "@/hooks/useIntegrations";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function GithubActivityWidget() {
  const { data, isLoading, isError } = useGithubActivity(GITHUB_USERNAME);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <GitBranch className="h-4 w-4" />
          GitHub Activity
          <span className="text-xs font-normal text-muted-foreground">
            @{GITHUB_USERNAME}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <p className="text-sm text-muted-foreground">Loading...</p>
        )}
        {isError && (
          <p className="text-sm text-destructive">
            Couldn&apos;t load activity.
          </p>
        )}
        {data && data.length === 0 && (
          <p className="text-sm text-muted-foreground">No recent pushes.</p>
        )}
        {data && data.length > 0 && (
          <ul className="space-y-2">
            {data.map((item, i) => (
              <li key={i} className="text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate font-medium">{item.repo}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                </div>
                {item.message && (
                  <p className="truncate text-xs text-muted-foreground">
                    {item.message}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
