"use client";

import * as React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";

import { makeQueryClient } from "@/lib/queryClient";
import { Toaster } from "@/components/ui/sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = React.useState(() => makeQueryClient());

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <QueryClientProvider client={client}>
        {children}
        <Toaster />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
