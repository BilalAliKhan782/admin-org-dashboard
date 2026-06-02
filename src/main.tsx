import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";
import { MissingSupabaseConfig } from "@/components/missing-supabase-config";
import { ThemeProvider } from "@/components/theme-provider";
import { router } from "@/router";
import { isSupabaseConfigured } from "@/lib/supabase";
import "@/styles.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {isSupabaseConfigured ? (
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      ) : (
        <MissingSupabaseConfig />
      )}
    </ThemeProvider>
  </React.StrictMode>,
);
