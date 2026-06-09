import { zodResolver } from "@hookform/resolvers/zod";
import { Building2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { authSchema, type AuthFormValues } from "@/schemas/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { PasswordStrengthIndicator } from "@/components/ui/password-strength";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";

export function AuthPage() {
  const location = useLocation();
  const authState = location.state as
    | {
        from?: Location;
        inviteEmail?: string;
        authMode?: "sign-in" | "sign-up";
      }
    | null;
  const invitedEmail = authState?.inviteEmail?.toLowerCase();
  const [mode, setMode] = useState<"sign-in" | "sign-up">(authState?.authMode ?? "sign-in");
  const [formError, setFormError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const form = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema),
    defaultValues: { email: invitedEmail ?? "", password: "" },
  });
  const password = form.watch("password");

  const fromLocation = authState?.from;
  const from = fromLocation ? `${fromLocation.pathname}${fromLocation.search}` : "/";

  if (!isLoading && user) {
    return <Navigate to={from} replace />;
  }

  async function onSubmit(values: AuthFormValues) {
    setFormError(null);
    const credentials = {
      email: invitedEmail ?? values.email,
      password: values.password,
    };
    const result =
      mode === "sign-in"
        ? await supabase.auth.signInWithPassword(credentials)
        : await supabase.auth.signUp({
            ...credentials,
            options: {
              emailRedirectTo: `${window.location.origin}${from}`,
            },
          });

    if (result.error) {
      setFormError(result.error.message);
      toast({
        title: mode === "sign-in" ? "Sign in failed" : "Sign up failed",
        description: result.error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: mode === "sign-in" ? "Signed in" : "Account created",
      description: mode === "sign-in" ? "Welcome back." : "Your account is ready.",
      variant: "success",
    });
    if (mode === "sign-up" && !result.data.session) {
      toast({
        title: "Check your email",
        description: "Confirm your email, then return to this invitation to accept it.",
        variant: "warning",
        duration: 7000,
      });
      return;
    }

    navigate(from, { replace: true });
  }

  return (
    <div className="grid min-h-screen place-items-center px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Building2 className="h-6 w-6" />
          </div>
          <CardTitle>{mode === "sign-in" ? "Sign in" : "Create account"}</CardTitle>
          <CardDescription>
            {invitedEmail
              ? `Use ${invitedEmail} to accept your invitation.`
              : "Use your email and password to manage organizations."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-5 grid grid-cols-2 rounded-md border bg-muted p-1" role="tablist" aria-label="Authentication mode">
            <Button
              type="button"
              variant={mode === "sign-in" ? "secondary" : "ghost"}
              role="tab"
              aria-selected={mode === "sign-in"}
              onClick={() => {
                setMode("sign-in");
                setFormError(null);
              }}
            >
              Sign in
            </Button>
            <Button
              type="button"
              variant={mode === "sign-up" ? "secondary" : "ghost"}
              role="tab"
              aria-selected={mode === "sign-up"}
              onClick={() => {
                setMode("sign-up");
                setFormError(null);
              }}
            >
              Sign up
            </Button>
          </div>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
            <FormField label="Email" htmlFor="auth-email" error={form.formState.errors.email?.message}>
              <Input
                id="auth-email"
                type="email"
                autoComplete="email"
                readOnly={Boolean(invitedEmail)}
                {...form.register("email")}
              />
            </FormField>
            <FormField label="Password" htmlFor="auth-password" error={form.formState.errors.password?.message}>
              <Input
                id="auth-password"
                type="password"
                autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
                {...form.register("password")}
              />
              {mode === "sign-up" ? <PasswordStrengthIndicator password={password} /> : null}
            </FormField>
            {formError ? <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{formError}</p> : null}
            <Button className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Working..." : mode === "sign-in" ? "Sign in" : "Sign up"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
