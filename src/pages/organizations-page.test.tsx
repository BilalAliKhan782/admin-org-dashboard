import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { OrganizationsPage } from "@/pages/organizations-page";
import { useOrganizations } from "@/api/organizations";
import { getMyProfile } from "@/api/profile";

vi.mock("@/api/organizations", () => ({
  useOrganizations: vi.fn(),
}));

vi.mock("@/api/profile", () => ({
  getMyProfile: vi.fn(),
}));

const useOrganizationsMock = vi.mocked(useOrganizations);
const getMyProfileMock = vi.mocked(getMyProfile);

function renderOrganizationsPage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <OrganizationsPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("OrganizationsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getMyProfileMock.mockResolvedValue({
      id: "user-1",
      email: "admin@example.com",
      full_name: null,
      is_admin: true,
      created_at: new Date().toISOString(),
    });
  });

  it("renders organization rows with badge colors and navigation links", () => {
    useOrganizationsMock.mockReturnValue({
      data: [
        {
          id: "org-1",
          name: "River School",
          type: "school",
          member_count: 2,
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          created_by: "user-1",
          school_district: "North Valley",
          tax_id: null,
          business_domain: null,
        },
      ],
      isLoading: false,
      isError: false,
    } as never);

    renderOrganizationsPage();

    expect(screen.getByText("River School").closest("a")).toHaveAttribute("href", "/organizations/org-1");
    expect(screen.getByText("School")).toHaveClass("bg-sky-50");
    expect(screen.getAllByText("2 members")).toHaveLength(2);
    expect(screen.getByText("2 days ago")).toBeInTheDocument();
  });

  it("renders the empty state", () => {
    useOrganizationsMock.mockReturnValue({ data: [], isLoading: false, isError: false } as never);

    renderOrganizationsPage();

    expect(screen.getByText("No organizations yet")).toBeInTheDocument();
  });
});
