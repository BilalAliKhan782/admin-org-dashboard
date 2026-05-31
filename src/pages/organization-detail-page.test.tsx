import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { OrganizationDetailPage } from "@/pages/organization-detail-page";
import { useInviteMember, useMembers, useOrganization } from "@/api/organizations";

vi.mock("@/api/organizations", () => ({
  useOrganization: vi.fn(),
  useMembers: vi.fn(),
  useInviteMember: vi.fn(),
}));

const useOrganizationMock = vi.mocked(useOrganization);
const useMembersMock = vi.mocked(useMembers);
const useInviteMemberMock = vi.mocked(useInviteMember);
const mutate = vi.fn();

function renderDetailPage() {
  return render(
    <MemoryRouter initialEntries={["/organizations/org-1"]}>
      <Routes>
        <Route path="/organizations/:organizationId" element={<OrganizationDetailPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("OrganizationDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useOrganizationMock.mockReturnValue({
      data: {
        id: "org-1",
        name: "Acme Ops",
        type: "business",
        created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        created_by: "user-1",
        school_district: null,
        tax_id: null,
        business_domain: "acme.test",
      },
      isLoading: false,
      isError: false,
    } as never);
    useMembersMock.mockReturnValue({
      data: [
        {
          id: "member-1",
          organization_id: "org-1",
          user_id: null,
          email: "member@example.com",
          status: "invited",
          role: "member",
          invited_at: new Date(Date.now() - 60 * 1000).toISOString(),
          joined_at: null,
        },
      ],
      isLoading: false,
    } as never);
    useInviteMemberMock.mockReturnValue({ mutate, isPending: false, isError: false } as never);
  });

  it("renders organization type details and member status badges", () => {
    renderDetailPage();

    expect(screen.getByText("Acme Ops")).toBeInTheDocument();
    expect(screen.getByText("Business domain:")).toBeInTheDocument();
    expect(screen.getByText("acme.test")).toBeInTheDocument();
    expect(screen.getByText("invited")).toHaveClass("bg-amber-50");
    expect(screen.getByText("1 minute ago")).toBeInTheDocument();
  });

  it("submits member invitations with lowercased email", async () => {
    renderDetailPage();

    await userEvent.type(screen.getByLabelText(/email/i), "New.Member@Example.COM");
    fireEvent.click(screen.getByRole("button", { name: /invite/i }));

    await waitFor(() => {
      expect(mutate).toHaveBeenCalledWith(
        { email: "new.member@example.com", role: "member" },
        expect.objectContaining({ onSuccess: expect.any(Function) }),
      );
    });
  });

  it("displays invitation errors", () => {
    useInviteMemberMock.mockReturnValue({
      mutate,
      isPending: false,
      isError: true,
      error: { message: "This email has already been invited to the organization." },
    } as never);

    renderDetailPage();

    expect(screen.getByText("This email has already been invited to the organization.")).toBeInTheDocument();
  });
});
