import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/app-layout";
import { ProtectedRoute } from "@/components/protected-route";
import { AcceptInvitationPage } from "@/pages/accept-invitation-page";
import { AuthPage } from "@/pages/auth-page";
import { CreateOrganizationPage } from "@/pages/create-organization-page";
import { OrganizationDetailPage } from "@/pages/organization-detail-page";
import { OrganizationsPage } from "@/pages/organizations-page";

export const router = createBrowserRouter([
  {
    path: "/auth",
    element: <AuthPage />,
  },
  {
    path: "/accept-invitation/:token",
    element: <AcceptInvitationPage />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <OrganizationsPage /> },
      { path: "organizations/new", element: <CreateOrganizationPage /> },
      { path: "organizations/:organizationId", element: <OrganizationDetailPage /> },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
