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
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";

export function AuthPage() {
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [formError, setFormError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoading } = useAuth();
  const form = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema),
    defaultValues: { email: "", password: "" },
  });

  const from = (location.state as { from?: Location } | null)?.from?.pathname ?? "/";

  if (!isLoading && user) {
    return <Navigate to="/" replace />;
  }

  async function onSubmit(values: AuthFormValues) {
    setFormError(null);
    const result =
      mode === "sign-in"
        ? await supabase.auth.signInWithPassword(values)
        : await supabase.auth.signUp(values);

    if (result.error) {
      setFormError(result.error.message);
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
          <CardTitle>{mode === "sign-in" ? "Sign in" : "Create admin account"}</CardTitle>
          <CardDescription>Use an admin email and password to manage organizations.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField label="Email" error={form.formState.errors.email?.message}>
              <Input type="email" autoComplete="email" {...form.register("email")} />
            </FormField>
            <FormField label="Password" error={form.formState.errors.password?.message}>
              <Input type="password" autoComplete={mode === "sign-in" ? "current-password" : "new-password"} {...form.register("password")} />
            </FormField>
            {formError ? <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{formError}</p> : null}
            <Button className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Working..." : mode === "sign-in" ? "Sign in" : "Sign up"}
            </Button>
          </form>
          <Button className="mt-3 w-full" variant="ghost" onClick={() => setMode(mode === "sign-in" ? "sign-up" : "sign-in")}>
            {mode === "sign-in" ? "Need an account? Sign up" : "Already have an account? Sign in"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
