import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";
import { ErrorBoundary } from "@/components/error-boundary";
import { MissingSupabaseConfig } from "@/components/missing-supabase-config";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { initAnalytics } from "@/lib/analytics";
import { validateEnv } from "@/lib/env";
import { measurePageLoad } from "@/lib/performance";
import { initSentry } from "@/lib/sentry";
import { router } from "@/router";
import { isSupabaseConfigured } from "@/lib/supabase";
import "@/styles.css";

validateEnv();
initSentry();
initAnalytics();
measurePageLoad();

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
    <ErrorBoundary>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        {isSupabaseConfigured ? (
          <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} />
            <Toaster />
          </QueryClientProvider>
        ) : (
          <MissingSupabaseConfig />
        )}
      </ThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);

if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      console.log("Service worker registration failed");
    });
  });
}
