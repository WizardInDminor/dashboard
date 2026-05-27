"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

const TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/projects": "Projects",
  "/tasks": "Tasks",
};

function titleForPath(pathname: string): string {
  if (TITLES[pathname]) return TITLES[pathname];
  if (pathname.startsWith("/projects")) return "Project";
  if (pathname.startsWith("/tasks")) return "Tasks";
  return "Dashboard";
}

export function Header() {
  const pathname = usePathname();
  const [now, setNow] = React.useState<Date | null>(null);

  React.useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000 * 30);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="flex h-16 items-center justify-between border-b px-6">
      <h1 className="text-xl font-semibold tracking-tight">
        {titleForPath(pathname)}
      </h1>
      {now && (
        <div className="text-right text-sm text-muted-foreground">
          <div>
            {now.toLocaleDateString(undefined, {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </div>
          <div className="tabular-nums">
            {now.toLocaleTimeString(undefined, {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
      )}
    </header>
  );
}
