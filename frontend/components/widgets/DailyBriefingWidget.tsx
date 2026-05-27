"use client";

import * as React from "react";
import ReactMarkdown from "react-markdown";
import { RefreshCw, Sparkles } from "lucide-react";

import { streamRequest } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function DailyBriefingWidget() {
  const [text, setText] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(false);
  const abortRef = React.useRef<AbortController | null>(null);

  const runBriefing = React.useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setText("");
    setError(false);
    setLoading(true);
    try {
      await streamRequest("/api/ai/briefing", {
        method: "GET",
        signal: controller.signal,
        onChunk: (chunk) => setText((prev) => prev + chunk),
      });
    } catch {
      if (!controller.signal.aborted) setError(true);
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    runBriefing();
    return () => abortRef.current?.abort();
  }, [runBriefing]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-4 w-4" />
          Daily Briefing
        </CardTitle>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={runBriefing}
          disabled={loading}
          aria-label="Refresh briefing"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </CardHeader>
      <CardContent>
        {error && (
          <p className="text-sm text-destructive">
            Couldn&apos;t generate a briefing. Check the AI configuration.
          </p>
        )}
        {!error && !text && loading && (
          <p className="text-sm text-muted-foreground">
            Generating your briefing...
          </p>
        )}
        {text && (
          <div className="prose prose-sm max-w-none dark:prose-invert [&_h1]:text-base [&_h2]:text-sm [&_li]:my-0 [&_p]:my-1">
            <ReactMarkdown>{text}</ReactMarkdown>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
