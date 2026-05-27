"use client";

import Link from "next/link";
import { AlertTriangle, CalendarClock, ChevronRight } from "lucide-react";

import { useDashboard } from "@/hooks/useDashboard";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function TaskSummaryWidget() {
  const { data, isLoading, isError } = useDashboard();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <CalendarClock className="h-4 w-4" />
          Today&apos;s Tasks
        </CardTitle>
        <Link
          href="/tasks"
          className="flex items-center text-xs text-muted-foreground hover:underline"
        >
          View all
          <ChevronRight className="h-3 w-3" />
        </Link>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading && (
          <div className="space-y-2">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-3/4" />
          </div>
        )}
        {isError && (
          <p className="text-sm text-destructive">Failed to load.</p>
        )}
        {data && (
          <>
            {data.overdue_count > 0 && (
              <div className="flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                <AlertTriangle className="h-4 w-4" />
                {data.overdue_count} overdue{" "}
                {data.overdue_count === 1 ? "task" : "tasks"}
              </div>
            )}
            {data.due_today.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nothing due today. 🎉
              </p>
            ) : (
              <ul className="space-y-2">
                {data.due_today.map((task) => (
                  <li
                    key={task.id}
                    className="flex items-center justify-between gap-2"
                  >
                    <span className="truncate text-sm">{task.title}</span>
                    <Badge variant="outline" className="shrink-0">
                      {task.priority}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
