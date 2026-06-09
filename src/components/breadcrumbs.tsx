import { ChevronRight, Home } from "lucide-react";
import { Link, useLocation, useParams } from "react-router-dom";

export function Breadcrumbs() {
  const location = useLocation();
  const { organizationId } = useParams();
  const pathnames = location.pathname.split("/").filter(Boolean);

  if (pathnames.length === 0) return null;

  const labels: Record<string, string> = {
    organizations: "Organizations",
    new: "New organization",
  };

  return (
    <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1 text-sm text-muted-foreground">
      <Link to="/" className="flex items-center rounded-sm transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <Home className="h-4 w-4" />
      </Link>
      {pathnames.map((name, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join("/")}`;
        const isLast = index === pathnames.length - 1;
        const displayName = name === organizationId ? `${name.slice(0, 8)}...` : labels[name] ?? name;

        return (
          <div key={routeTo} className="flex items-center gap-1">
            <ChevronRight className="h-4 w-4" />
            {isLast ? (
              <span className="font-medium text-foreground">{displayName}</span>
            ) : (
              <Link to={routeTo} className="rounded-sm transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                {displayName}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
