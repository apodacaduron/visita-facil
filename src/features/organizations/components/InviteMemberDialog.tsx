"use client";

import { Loader2Icon } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
    Form, FormControl, FormField, FormItem, FormLabel, FormMessage
} from '@/components/ui/form';
import { supabase } from '@/lib/supabase';
import { zodResolver } from '@hookform/resolvers/zod';
import { DialogProps } from '@radix-ui/react-dialog';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const inviteSchema = z.object({
  email: z.string().email({ message: "Correo electrónico inválido" }),
  role_id: z.string().min(1, { message: "Selecciona un rol" }),
});
type InviteSchema = z.infer<typeof inviteSchema>;

type Props = {
  dialogProps: DialogProps;
  onSuccess?: () => void;
  queryKeyGetter(): unknown[];
};

export default function InviteMemberDialog(props: Props) {
  const params = useParams();
  const queryClient = useQueryClient();

  // Fetch roles dynamically
  const { data: roles, isLoading: rolesLoading } = useQuery({
    queryKey: ["roles"],
    queryFn: async () => {
      const { data } = await supabase.from("roles").select("*").order("name").neq('name', 'owner');
      return data ?? [];
    },
  });

  const form = useForm<InviteSchema>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: "",
      role_id: "",
    },
  });

  const inviteMutation = useMutation({
    mutationFn: async (data: InviteSchema) => {
      const organization_id = params.organizationId?.toString();
      if (!organization_id) throw new Error("Organization id not provided");

      const user = await supabase
        .from("users")
        .upsert({
          email: data.email,
        })
        .select()
        .single()
        .throwOnError();

      const userId = user.data?.id;
      if (!userId) throw new Error("User id not found");

      return supabase
        .from("organization_memberships")
        .insert({
          user_id: userId,
          role_id: data.role_id,
          organization_id,
          status: "invited",
        })
        .throwOnError();
    },
    async onSuccess(_, variables) {
      await queryClient.invalidateQueries({ queryKey: props.queryKeyGetter() });
      toast.success("Member invited!", { description: variables.email });
      form.reset();
      props.onSuccess?.();
    },
    onError(error) {
      toast.error("Failed to invite member", { description: error.message });
    },
  });

  async function onSubmit(data: InviteSchema) {
    await inviteMutation.mutateAsync(data);
  }

  return (
    <Dialog {...props.dialogProps}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite New Member</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 pt-2"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <input
                      type="email"
                      placeholder="user@example.com"
                      {...field}
                      className="w-full rounded-md border px-2 py-1"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      disabled={rolesLoading}
                      className="w-full rounded-md border px-2 py-1"
                    >
                      <option value="">Select a role</option>
                      {roles?.map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.name}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full mt-4"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting && (
                <Loader2Icon className="animate-spin" />
              )}
              Invite
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
