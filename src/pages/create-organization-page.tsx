import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle, Save, XCircle } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useCreateOrganization } from "@/api/organizations";
import { getMyProfile } from "@/api/profile";
import { AutoSaveIndicator } from "@/components/ui/auto-save-indicator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { RippleButton } from "@/components/ui/ripple-button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { organizationTypes } from "@/constants/organizations";
import { useUnsavedChangesWarning } from "@/hooks/use-unsaved-changes-warning";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { organizationSchema, type OrganizationFormValues } from "@/schemas/organization";

export function CreateOrganizationPage() {
  const navigate = useNavigate();
  const profileQuery = useQuery({ queryKey: ["profile"], queryFn: getMyProfile });
  const form = useForm<OrganizationFormValues>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      name: "",
      type: "school",
      school_district: "",
      tax_id: "",
      business_domain: "",
    },
  });
  useUnsavedChangesWarning(form.formState.isDirty);
  const selectedType = form.watch("type");
  const typeConfig = organizationTypes.find((type) => type.value === selectedType)!;

  const mutation = useCreateOrganization();
  const draftStatus = form.formState.isSubmitting ? "saving" : form.formState.isSubmitSuccessful ? "saved" : "idle";

  if (profileQuery.isLoading) {
    return <p className="text-sm text-muted-foreground">Checking permissions...</p>;
  }

  if (!profileQuery.data?.is_admin) {
    return (
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Admin access required</CardTitle>
          <CardDescription>Only admins can create organizations. Invited members can access organizations they belong to.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button type="button" variant="outline" onClick={() => navigate("/")}>
            Back to organizations
          </Button>
        </CardContent>
      </Card>
    );
  }

  function onSubmit(values: OrganizationFormValues) {
    mutation.mutate(values, {
      onSuccess: (organization) => {
        toast({
          title: "Organization created",
          description: `"${values.name}" has been created successfully.`,
          variant: "success",
        });
        navigate(`/organizations/${organization.id}`);
      },
      onError: (error) => {
        toast({
          title: "Create failed",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  }

  return (
    <section className="max-w-2xl space-y-5">
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold">Create Organization</h1>
          <AutoSaveIndicator status={draftStatus} />
        </div>
        <p className="mt-1 text-sm text-muted-foreground">Choose a type and complete the required type-specific field.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Organization details</CardTitle>
          <CardDescription>{typeConfig.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
            <FormField label="Name" htmlFor="organization-name" error={form.formState.errors.name?.message}>
              <div className="space-y-1">
                <div className="relative">
                  <Input
                    id="organization-name"
                    {...form.register("name")}
                    maxLength={80}
                    placeholder="River City Partners"
                    className={cn(
                      "pr-10",
                      form.formState.errors.name && "border-destructive focus-visible:ring-destructive",
                      form.watch("name") && !form.formState.errors.name && "border-emerald-500 focus-visible:ring-emerald-500",
                    )}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {form.formState.errors.name ? <XCircle className="h-4 w-4 text-destructive" /> : null}
                    {form.watch("name") && !form.formState.errors.name ? (
                      <CheckCircle className="h-4 w-4 text-emerald-500" />
                    ) : null}
                  </div>
                </div>
                <p className="text-right text-xs text-muted-foreground">
                  {80 - (form.watch("name")?.length ?? 0)} characters remaining
                </p>
              </div>
            </FormField>
            <FormField label="Type" htmlFor="organization-type" error={form.formState.errors.type?.message}>
              <Controller
                control={form.control}
                name="type"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="organization-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {organizationTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>
            <FormField
              label={typeConfig.conditionalLabel}
              htmlFor={`organization-${typeConfig.conditionalField}`}
              error={form.formState.errors[typeConfig.conditionalField]?.message}
            >
              <Input
                id={`organization-${typeConfig.conditionalField}`}
                {...form.register(typeConfig.conditionalField)}
                placeholder={typeConfig.conditionalPlaceholder}
              />
            </FormField>
            {mutation.isError ? <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{mutation.error.message}</p> : null}
            <RippleButton disabled={mutation.isPending}>
              <Save className="h-4 w-4" />
              {mutation.isPending ? "Creating..." : "Create organization"}
            </RippleButton>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
