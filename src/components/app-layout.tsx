import { Building2, LogOut, Plus } from "lucide-react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

export function AppLayout() {
  const navigate = useNavigate();
  const { user } = useAuth();

  async function signOut() {
    await supabase.auth.signOut();
    navigate("/auth", { replace: true });
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <Link to="/" className="flex items-center gap-2 text-lg font-semibold">
            <Building2 className="h-5 w-5 text-primary" />
            Admin Organizations
          </Link>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span className="max-w-[240px] truncate">{user?.email}</span>
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </div>
        </div>
      </header>
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 md:grid-cols-[220px_1fr]">
        <nav className="flex gap-2 md:flex-col">
          <NavLink
            to="/"
            className={({ isActive }) =>
              cn("rounded-md px-3 py-2 text-sm font-medium hover:bg-muted", isActive && "bg-muted text-primary")
            }
            end
          >
            Directory
          </NavLink>
          <NavLink
            to="/organizations/new"
            className={({ isActive }) =>
              cn("inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted", isActive && "bg-muted text-primary")
            }
          >
            <Plus className="h-4 w-4" />
            Create
          </NavLink>
        </nav>
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
