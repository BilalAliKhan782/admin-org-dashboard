import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getMyProfile } from "@/api/profile";
import { useAuth } from "@/hooks/use-auth";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation();
  const { user, isLoading } = useAuth();
  const profileQuery = useQuery({
    queryKey: ["profile"],
    queryFn: getMyProfile,
    enabled: Boolean(user),
    retry: false,
  });

  if (isLoading || profileQuery.isLoading) {
    return <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">Loading workspace...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  if (profileQuery.isError || !profileQuery.data) {
    return (
      <div className="grid min-h-screen place-items-center px-4 text-center">
        <div>
          <h1 className="text-xl font-semibold">Profile required</h1>
          <p className="mt-2 text-sm text-muted-foreground">This workspace requires a signed-in user profile.</p>
        </div>
      </div>
    );
  }

  return children;
}
