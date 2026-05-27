"use client";

import { Newspaper } from "lucide-react";

import { useNews } from "@/hooks/useIntegrations";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function NewsWidget() {
  const { data, isLoading, isError } = useNews();

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Newspaper className="h-4 w-4" />
          Top Stories
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-5 w-full" />
            ))}
          </div>
        )}
        {isError && (
          <p className="text-sm text-destructive">Couldn&apos;t load news.</p>
        )}
        {data && data.length === 0 && (
          <p className="text-sm text-muted-foreground">No stories.</p>
        )}
        {data && data.length > 0 && (
          <ol className="space-y-2">
            {data.map((item, i) => (
              <li key={i} className="flex gap-2 text-sm">
                <span className="text-muted-foreground">{i + 1}.</span>
                {item.url ? (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="line-clamp-2 hover:underline"
                  >
                    {item.title}
                  </a>
                ) : (
                  <span className="line-clamp-2">{item.title}</span>
                )}
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
