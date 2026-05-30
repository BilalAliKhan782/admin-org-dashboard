import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Save } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { createOrganization } from "@/api/organizations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { organizationTypes } from "@/constants/organizations";
import { organizationSchema, type OrganizationFormValues } from "@/schemas/organization";

export function CreateOrganizationPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
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
  const selectedType = form.watch("type");
  const typeConfig = organizationTypes.find((type) => type.value === selectedType)!;

  const mutation = useMutation({
    mutationFn: createOrganization,
    onSuccess: async (organization) => {
      await queryClient.invalidateQueries({ queryKey: ["organizations"] });
      navigate(`/organizations/${organization.id}`);
    },
  });

  return (
    <section className="max-w-2xl space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Create Organization</h1>
        <p className="mt-1 text-sm text-muted-foreground">Choose a type and complete the required type-specific field.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Organization details</CardTitle>
          <CardDescription>{typeConfig.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
            <FormField label="Name" error={form.formState.errors.name?.message}>
              <Input {...form.register("name")} placeholder="River City Partners" />
            </FormField>
            <FormField label="Type" error={form.formState.errors.type?.message}>
              <Controller
                control={form.control}
                name="type"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
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
              error={form.formState.errors[typeConfig.conditionalField]?.message}
            >
              <Input
                {...form.register(typeConfig.conditionalField)}
                placeholder={typeConfig.conditionalPlaceholder}
              />
            </FormField>
            {mutation.isError ? <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{mutation.error.message}</p> : null}
            <Button disabled={mutation.isPending}>
              <Save className="h-4 w-4" />
              {mutation.isPending ? "Creating..." : "Create organization"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
