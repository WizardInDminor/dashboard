"use client";

import * as React from "react";
import { QueryClientProvider } from "@tanstack/react-query";

import { makeQueryClient } from "@/lib/queryClient";

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = React.useState(() => makeQueryClient());

  return (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
}
