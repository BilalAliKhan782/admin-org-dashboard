import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthPage } from "@/pages/auth-page";
import { supabase } from "@/lib/supabase";

vi.mock("@/hooks/use-auth", () => ({
  useAuth: () => ({ user: null, session: null, isLoading: false }),
}));

vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
    },
  },
}));

const signInWithPassword = vi.mocked(supabase.auth.signInWithPassword);
const signUp = vi.mocked(supabase.auth.signUp);

function renderAuthPage() {
  return render(
    <MemoryRouter initialEntries={["/auth"]}>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/" element={<h1>Dashboard</h1>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("AuthPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    signInWithPassword.mockResolvedValue({ data: { user: null, session: null }, error: null } as never);
    signUp.mockResolvedValue({ data: { user: null, session: null }, error: null } as never);
  });

  it("validates email format", async () => {
    renderAuthPage();

    await userEvent.type(screen.getByLabelText(/email/i), "not-an-email");
    await userEvent.type(screen.getByLabelText(/password/i), "password123");
    fireEvent.click(screen.getByRole("button", { name: /^sign in$/i }));

    expect(await screen.findByText("Enter a valid email address.")).toBeInTheDocument();
    expect(signInWithPassword).not.toHaveBeenCalled();
  });

  it("validates password length", async () => {
    renderAuthPage();

    await userEvent.type(screen.getByLabelText(/email/i), "admin@example.com");
    await userEvent.type(screen.getByLabelText(/password/i), "short");
    fireEvent.click(screen.getByRole("button", { name: /^sign in$/i }));

    expect(await screen.findByText("Password must be at least 8 characters.")).toBeInTheDocument();
    expect(signInWithPassword).not.toHaveBeenCalled();
  });

  it("submits valid sign-in credentials and navigates to the dashboard", async () => {
    renderAuthPage();

    await userEvent.type(screen.getByLabelText(/email/i), "Admin@Example.com");
    await userEvent.type(screen.getByLabelText(/password/i), "password123");
    fireEvent.click(screen.getByRole("button", { name: /^sign in$/i }));

    await waitFor(() => {
      expect(signInWithPassword).toHaveBeenCalledWith({
        email: "admin@example.com",
        password: "password123",
      });
    });
    expect(await screen.findByRole("heading", { name: /dashboard/i })).toBeInTheDocument();
  });

  it("submits valid sign-up credentials", async () => {
    renderAuthPage();

    await userEvent.click(screen.getByRole("tab", { name: /sign up/i }));
    await userEvent.type(screen.getByLabelText(/email/i), "new-admin@example.com");
    await userEvent.type(screen.getByLabelText(/password/i), "password123");
    fireEvent.click(screen.getByRole("button", { name: /^sign up$/i }));

    await waitFor(() => {
      expect(signUp).toHaveBeenCalledWith({
        email: "new-admin@example.com",
        password: "password123",
      });
    });
  });

  it("displays authentication failures", async () => {
    signInWithPassword.mockResolvedValueOnce({
      data: { user: null, session: null },
      error: { message: "Invalid login credentials" },
    } as never);
    renderAuthPage();

    await userEvent.type(screen.getByLabelText(/email/i), "admin@example.com");
    await userEvent.type(screen.getByLabelText(/password/i), "password123");
    fireEvent.click(screen.getByRole("button", { name: /^sign in$/i }));

    expect(await screen.findByText("Invalid login credentials")).toBeInTheDocument();
  });
});
