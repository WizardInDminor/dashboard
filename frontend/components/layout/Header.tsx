"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";

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

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Toggle theme"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      {mounted && resolvedTheme === "dark" ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </Button>
  );
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
    <header className="flex h-16 items-center justify-between border-b px-4 sm:px-6">
      <h1 className="text-xl font-semibold tracking-tight">
        {titleForPath(pathname)}
      </h1>
      <div className="flex items-center gap-3">
        {now && (
          <div className="hidden text-right text-sm text-muted-foreground sm:block">
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
        <ThemeToggle />
      </div>
    </header>
  );
}
