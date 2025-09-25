"use client";

import { Loader2Icon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const organizationSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
});

type OrganizationSchema = z.infer<typeof organizationSchema>;

export default function CreateOrganizationForm() {
    const router = useRouter();
    const queryClient = useQueryClient();

    const form = useForm<OrganizationSchema>({
      resolver: zodResolver(organizationSchema),
      defaultValues: {
        name: "",
      },
    });
  
    const createMutation = useMutation({
    mutationFn: async (data: OrganizationSchema) => {
      return supabase.from("organizations").insert(data).select().single().throwOnError();
    },
    async onSuccess(response, variables) {
      await queryClient.invalidateQueries({ queryKey: ['organizations'] });
      toast.success("Organization added!", {
        description: variables.name,
      });
      form.reset();

      const organizationId = response.data.id
      router.push(`/org/${organizationId}/dashboard`)
    },
    onError(error) {
      toast.error("Failed to add visitor", {
        description: error.message,
      });
    },
  });

  async function onSubmit(data: OrganizationSchema) {
    await createMutation.mutateAsync(data);
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <div className="grid gap-6">
        <div className="grid gap-6">
          <div className="grid gap-3">
            <Label htmlFor="name">Nombre de la organización</Label>
            <Input
              id="name"
              type="text"
              placeholder="Ej. Museo Quinta Gameros"
              {...form.register("name", { required: "Nombre es requerido" })}
            />
          </div>
          <Button
            type="submit"
            className="w-full mt-4"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting && (
              <Loader2Icon className="animate-spin" />
            )}
            Create
          </Button>
        </div>
      </div>
    </form>
  );
}