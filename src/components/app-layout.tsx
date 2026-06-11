import { Building2, LogOut, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { PageTransition } from "@/components/page-transition";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { getMyProfile } from "@/api/profile";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

export function AppLayout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const profileQuery = useQuery({
    queryKey: ["profile"],
    queryFn: getMyProfile,
    enabled: Boolean(user),
    staleTime: 60_000,
  });
  const canCreateOrganizations = profileQuery.data?.is_admin === true;
  useKeyboardShortcuts();

  async function signOut() {
    await supabase.auth.signOut();
    navigate("/auth", { replace: true });
  }

  return (
    <div className="min-h-screen bg-background">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[120] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <header className="border-b bg-card shadow-sm">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <Link to="/" className="group flex items-center gap-2 text-lg font-semibold transition-opacity hover:opacity-85">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-transform group-hover:scale-110">
              <Building2 className="h-5 w-5" />
            </span>
            AdminDash
          </Link>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span className="max-w-[240px] truncate">{user?.email}</span>
            <ThemeToggle />
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </div>
        </div>
      </header>
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 md:grid-cols-[240px_1fr]">
        <nav className="flex gap-2 rounded-lg bg-primary p-3 text-primary-foreground shadow-[0_8px_20px_hsl(var(--foreground)/0.18)] md:min-h-[calc(100vh-7.5rem)] md:flex-col md:p-4 dark:shadow-[0_8px_20px_hsl(0_0%_0%/0.45)]">
          <div className="hidden border-b border-primary-foreground/20 pb-4 md:block">
            <p className="text-xs uppercase tracking-[0.18em] text-primary-foreground/60">Workspace</p>
            <p className="mt-2 truncate text-lg font-semibold">AdminDash</p>
          </div>
          <div className="flex gap-2 md:flex-col md:pt-2">
            <NavLink
              to="/"
              className={({ isActive }) =>
                cn(
                  "rounded-md px-3 py-2 text-sm font-medium hover:bg-primary-foreground/15",
                  isActive && "bg-background text-foreground shadow-sm hover:bg-background",
                )
              }
              end
            >
              Directory
            </NavLink>
            {canCreateOrganizations ? (
              <NavLink
                to="/organizations/new"
                className={({ isActive }) =>
                  cn(
                    "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-primary-foreground/15",
                    isActive && "bg-background text-foreground shadow-sm hover:bg-background",
                  )
                }
              >
                <Plus className="h-4 w-4" />
                Create
              </NavLink>
            ) : null}
          </div>
          <div className="mt-auto hidden border-t border-primary-foreground/20 pt-4 text-xs text-primary-foreground/60 md:block">
            <p className="truncate">{user?.email}</p>
          </div>
        </nav>
        <main id="main-content" className="min-w-0">
          <Breadcrumbs />
          <PageTransition>
            <Outlet />
          </PageTransition>
        </main>
      </div>
    </div>
  );
}
