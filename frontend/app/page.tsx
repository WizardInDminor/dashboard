"use client";

import * as React from "react";

import { DailyBriefingWidget } from "@/components/widgets/DailyBriefingWidget";
import { GithubActivityWidget } from "@/components/widgets/GithubActivityWidget";
import { NewsWidget } from "@/components/widgets/NewsWidget";
import { ProjectsWidget } from "@/components/widgets/ProjectsWidget";
import { TaskSummaryWidget } from "@/components/widgets/TaskSummaryWidget";
import { WeatherWidget } from "@/components/widgets/WeatherWidget";

function greetingForHour(hour: number): string {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function Home() {
  const [now, setNow] = React.useState<Date | null>(null);

  React.useEffect(() => {
    setNow(new Date());
  }, []);

  const greeting = now ? greetingForHour(now.getHours()) : "Welcome back";
  const today = now
    ? now.toLocaleDateString(undefined, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">{greeting}</h2>
        <p className="text-muted-foreground">{today}</p>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DailyBriefingWidget />
        </div>
        <TaskSummaryWidget />
        <ProjectsWidget />
        <WeatherWidget />
        <NewsWidget />
        <GithubActivityWidget />
      </div>
    </div>
  );
}
